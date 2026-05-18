import { _decorator, Component, Node, sys, UITransform, view, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

declare const wx: any;

@ccclass('HomeLayout')
export class HomeLayout extends Component {
    @property(Node)
    bg: Node | null = null;

    @property(Node)
    PageTop: Node | null = null;

    @property(Node)
    BottomNav: Node | null = null;

    // 设计稿尺寸只作为比例换算基准，不代表真实设备尺寸。
    @property
    designWidth = 750;

    @property
    designHeight = 1600;

    // 顶部模块额外留白，按设计稿高度比例换算。
    @property
    topGap = 0;

    // 底部导航栏和设备底部安全区之间的额外留白，按设计稿高度比例换算。
    // 任务 / 背包 / 商城 / 签到建议都放在 BottomNav 下面，这样会一直固定在底部。
    @property
    bottomNavGap = 24;

    protected onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
    }

    protected onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
    }

    private applyLayout(): void {
        const visibleSize = view.getVisibleSize();
        const screenWidth = visibleSize.width;
        const screenHeight = visibleSize.height;
        const scaleY = screenHeight / this.designHeight;

        // 运行时读取当前设备安全区，不同微信机型会不一样。
        const safeTop = this.getWechatTopSafeAreaInCocosUnits(screenHeight);
        const safeBottom = this.getWechatBottomSafeAreaInCocosUnits(screenHeight);

        this.layoutBg(screenWidth, screenHeight);
        this.layoutPageTop(screenHeight, safeTop, scaleY);
        this.layoutBottomNav(screenHeight, safeBottom, scaleY);
    }

    private layoutBg(screenWidth: number, screenHeight: number): void {
        if (!this.bg) return;

        this.bg.setPosition(new Vec3(0, screenHeight/2, 0));
    }

    private layoutPageTop(screenHeight: number, safeTop: number, scaleY: number): void {
        if (!this.PageTop) return;

        // 顶部坐标 = screenHeight / 2。
        // PageTop 放在微信胶囊 / 刘海安全区下面。
        const y = screenHeight / 2 - safeTop - this.topGap * scaleY;
        this.PageTop.setPosition(new Vec3(0, y, 0));
    }

    private layoutBottomNav(screenHeight: number, safeBottom: number, scaleY: number): void {
        if (!this.BottomNav) return;

        const transform = this.BottomNav.getComponent(UITransform);
        const bottomNavHeight = transform ? transform.height : 0;
        const gap = this.bottomNavGap * scaleY;

        // 底部坐标 = -screenHeight / 2。
        // 节点锚点通常在中心，所以需要加上自身高度的一半。
        // safeBottom 用来避开 iPhone Home Indicator / 微信底部安全区。
        const y = -screenHeight / 2 + safeBottom + gap + bottomNavHeight / 2;
        this.BottomNav.setPosition(new Vec3(0, y, 0));
    }

    private getWechatTopSafeAreaInCocosUnits(screenHeight: number): number {
        if (sys.platform !== sys.Platform.WECHAT_GAME || typeof wx === 'undefined') {
            return 0;
        }

        try {
            const info = wx.getSystemInfoSync ? wx.getSystemInfoSync() : null;
            if (!info) return 0;

            const windowHeight = Number(info.windowHeight || info.screenHeight || 0);
            if (windowHeight <= 0) return 0;

            // 优先使用微信胶囊按钮底部。不同机型胶囊位置不同，这是顶部 UI 避让最准确的依据。
            let topSafePx = 0;
            if (wx.getMenuButtonBoundingClientRect) {
                const menuRect = wx.getMenuButtonBoundingClientRect();
                topSafePx = Number(menuRect?.bottom || 0);
            }

            // 兜底：没有胶囊信息时，使用 safeArea.top 或 statusBarHeight。
            if (topSafePx <= 0) {
                topSafePx = Number(info.safeArea?.top || info.statusBarHeight || 0);
            }

            return topSafePx * (screenHeight / windowHeight);
        } catch (error) {
            console.warn('[HomeLayout] failed to read WeChat top safe area', error);
            return 0;
        }
    }

    private getWechatBottomSafeAreaInCocosUnits(screenHeight: number): number {
        if (sys.platform !== sys.Platform.WECHAT_GAME || typeof wx === 'undefined') {
            return 0;
        }

        try {
            const info = wx.getSystemInfoSync ? wx.getSystemInfoSync() : null;
            if (!info) return 0;

            const windowHeight = Number(info.windowHeight || info.screenHeight || 0);
            if (windowHeight <= 0) return 0;

            // safeArea.bottom 到 windowHeight 之间的距离，就是底部安全区。
            const safeAreaBottom = Number(info.safeArea?.bottom || windowHeight);
            const bottomSafePx = Math.max(windowHeight - safeAreaBottom, 0);

            return bottomSafePx * (screenHeight / windowHeight);
        } catch (error) {
            console.warn('[HomeLayout] failed to read WeChat bottom safe area', error);
            return 0;
        }
    }
}
