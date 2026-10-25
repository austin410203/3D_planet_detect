import UIKit
import Capacitor
import GameKit

/// 自訂 Bridge 畫面：在這裡註冊 App 內建的本地外掛（Main.storyboard 指向這個類別）
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameCenterPlugin())
        bridge?.registerPluginInstance(StorePlugin())
    }
}

/// Game Center 外掛：登入、上傳分數、開啟排行榜
/// JS 端對應 src/gamecenter.js（registerPlugin('GameCenter')）
@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    public let identifier = "GameCenterPlugin"
    public let jsName = "GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise),
    ]

    private var pendingSignIn: [CAPPluginCall] = []
    private var handlerSet = false
    private var finishedOnce = false

    /// 登入 Game Center；需要時系統會跳出登入畫面。回傳 { authenticated: Bool }
    @objc func signIn(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let player = GKLocalPlayer.local
            if player.isAuthenticated {
                call.resolve(["authenticated": true])
                return
            }
            // 系統只會提示一次：玩家取消過就直接回傳未登入
            if self.finishedOnce {
                call.resolve(["authenticated": false])
                return
            }
            self.pendingSignIn.append(call)
            if self.handlerSet { return }
            self.handlerSet = true
            player.authenticateHandler = { [weak self] viewController, _ in
                guard let self = self else { return }
                if let viewController = viewController {
                    self.bridge?.viewController?.present(viewController, animated: true)
                    return
                }
                self.finishedOnce = true
                let ok = GKLocalPlayer.local.isAuthenticated
                let calls = self.pendingSignIn
                self.pendingSignIn = []
                calls.forEach { $0.resolve(["authenticated": ok]) }
            }
        }
    }

    /// 上傳分數：{ leaderboardId, score }（時間類排行榜的 score 單位為 1/100 秒）
    @objc func submitScore(_ call: CAPPluginCall) {
        guard let id = call.getString("leaderboardId"), let score = call.getInt("score") else {
            call.reject("缺少 leaderboardId 或 score")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("尚未登入 Game Center")
            return
        }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [id]) { error in
            if let error = error { call.reject(error.localizedDescription) } else { call.resolve() }
        }
    }

    /// 開啟排行榜：{ leaderboardId? }，不帶 id 時顯示全部排行榜
    @objc func showLeaderboard(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let vc: GKGameCenterViewController
            if let id = call.getString("leaderboardId") {
                vc = GKGameCenterViewController(leaderboardID: id, playerScope: .global, timeScope: .allTime)
            } else {
                vc = GKGameCenterViewController(state: .leaderboards)
            }
            vc.gameCenterDelegate = self
            self.bridge?.viewController?.present(vc, animated: true)
            call.resolve()
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
