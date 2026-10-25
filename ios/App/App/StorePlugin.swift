import Foundation
import Capacitor
import StoreKit

/// App 內購買外掛（StoreKit 2）：查詢商品、購買、恢復購買、查詢已擁有的商品
/// JS 端對應 src/store.js（registerPlugin('Store')）。交易由 StoreKit 2 在裝置上驗證，不需要自己的伺服器。
@objc(StorePlugin)
public class StorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StorePlugin"
    public let jsName = "Store"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getEntitlements", returnType: CAPPluginReturnPromise),
    ]

    private var updatesTask: Task<Void, Never>?

    /// 監聽 App 外發生的交易（家長同意、退款、其他裝置購買），有變動就通知 JS
    override public func load() {
        updatesTask = Task.detached { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await transaction.finish()
                }
                let ids = await StorePlugin.ownedProductIds()
                self?.notifyListeners("entitlementsChanged", data: ["productIds": ids])
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    /// 目前擁有（已驗證、未退款）的商品 ID
    static func ownedProductIds() async -> [String] {
        var ids: [String] = []
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result, transaction.revocationDate == nil {
                ids.append(transaction.productID)
            }
        }
        return ids
    }

    /// 查詢商品：{ productIds: [String] } → { products: [{ id, displayName, description, displayPrice }] }
    @objc func getProducts(_ call: CAPPluginCall) {
        let ids = call.getArray("productIds", String.self) ?? []
        Task {
            do {
                let products = try await Product.products(for: ids)
                call.resolve(["products": products.map { [
                    "id": $0.id,
                    "displayName": $0.displayName,
                    "description": $0.description,
                    "displayPrice": $0.displayPrice,
                ] }])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    /// 購買：{ productId } → { status: purchased | cancelled | pending | failed }
    @objc func purchase(_ call: CAPPluginCall) {
        guard let id = call.getString("productId") else {
            call.reject("缺少 productId")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [id]).first else {
                    call.reject("找不到商品 \(id)")
                    return
                }
                switch try await product.purchase() {
                case .success(.verified(let transaction)):
                    await transaction.finish()
                    call.resolve(["status": "purchased"])
                case .success(.unverified):
                    call.resolve(["status": "failed"])
                case .userCancelled:
                    call.resolve(["status": "cancelled"])
                case .pending:
                    call.resolve(["status": "pending"]) // 例如「詢問後購買」等家長同意
                @unknown default:
                    call.resolve(["status": "failed"])
                }
            } catch {
                call.resolve(["status": "failed"])
            }
        }
    }

    /// 恢復購買：向 App Store 同步後回傳擁有的商品 → { productIds }
    @objc func restore(_ call: CAPPluginCall) {
        Task {
            try? await AppStore.sync() // 玩家取消 Apple ID 登入時會丟錯，仍回傳目前已知的結果
            call.resolve(["productIds": await StorePlugin.ownedProductIds()])
        }
    }

    /// 查詢擁有的商品（離線也可，StoreKit 會使用快取）→ { productIds }
    @objc func getEntitlements(_ call: CAPPluginCall) {
        Task {
            call.resolve(["productIds": await StorePlugin.ownedProductIds()])
        }
    }
}
