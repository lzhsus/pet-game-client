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

    // TopBar 与微信胶囊按钮/安全区底部之间的额外留白，按设计稿高度比例换算。
    @property
    topBarGap = 24;

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

        // 运行时读取当前设备的微信顶部安全区，不再使用固定 top 值。
        const safeTop = this.getWechatTopSafeAreaInCocosUnits(screenHeight);

        this.layoutBg(screenHeight);
        this.layoutPageTop(screenHeight, safeTop);
        this.layoutBottomNav(screenHeight)
    }

    private layoutBg(screenHeight: number): void {
        if (!this.bg) return;

        this.bg.setPosition(new Vec3(0, screenHeight / 2, 0));
    }

    private layoutPageTop(screenHeight: number, safeTop: number): void {
        if (!this.PageTop) return;

        const y = screenHeight / 2 - safeTop;
        this.PageTop.setPosition(new Vec3(0, y, 0));
    }


    private layoutBottomNav(screenHeight: number): void {
        if (!this.BottomNav) return;

        this.BottomNav.setPosition(new Vec3(0, -screenHeight / 2, 0));
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
            console.warn('[HomeLayout] failed to read WeChat safe area', error);
            return 0;
        }
    }
}
