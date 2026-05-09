const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeScene extends cc.Component {

    @property(cc.Label)
    CoinLabel = null;

    @property(cc.Label)
    DiamondLabel = null;

    @property(cc.Label)
    PetNameLabel = null;

    @property(cc.Label)
    PetInfoLabel = null;

    @property(cc.Label)
    StatusLabel = null;

    start() {
        this.initGame();
    }

    initGame() {
        const self = this;

        this.setStatus('连接服务器中...');

        window.UserManager.login()
            .then(function () {
                return window.PetManager.getInfo();
            })
            .then(function () {
                self.refreshView();
                self.setStatus('服务器连接成功');
            })
            .catch(function (error) {
                console.error(error);
                self.setStatus(error.message || '连接失败');
            });
    }

    refreshView() {
        const user = window.UserManager.user;
        const pet = window.PetManager.pet;

        if (user) {
            this.CoinLabel.string = '金币：' + user.coin;
            this.DiamondLabel.string = '钻石：' + user.diamond;
        }

        if (pet) {
            this.PetNameLabel.string = pet.name;

            this.PetInfoLabel.string =
                '等级：' + pet.level + '\n' +
                '经验：' + pet.exp + '\n' +
                '饥饿：' + pet.hunger + '\n' +
                '清洁：' + pet.clean + '\n' +
                '心情：' + pet.mood;
        }
    }

    setStatus(message) {
        if (this.StatusLabel) {
            this.StatusLabel.string = message;
        }
    }

    onClickFeed() {
        this.runAction('feed', '喂食成功');
    }

    onClickBath() {
        this.runAction('bath', '洗澡成功');
    }

    onClickPlay() {
        this.runAction('play', '玩耍成功');
    }

    runAction(type, successMessage) {
        const self = this;

        let request = null;

        if (type === 'feed') {
            request = window.PetManager.feed();
        }

        if (type === 'bath') {
            request = window.PetManager.bath();
        }

        if (type === 'play') {
            request = window.PetManager.play();
        }

        if (!request) {
            return;
        }

        request
            .then(function () {
                self.refreshView();
                self.setStatus(successMessage);
            })
            .catch(function (error) {
                console.error(error);
                self.setStatus(error.message || '操作失败');
            });
    }
}
