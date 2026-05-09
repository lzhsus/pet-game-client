# Cocos 首页场景搭建指南

目标节点结构：

```text
Canvas
├── Bg
├── TopBar
│   ├── CoinLabel
│   └── DiamondLabel
├── PetArea
│   ├── PetSprite
│   ├── PetNameLabel
│   └── PetInfoLabel
├── StatusLabel
├── FeedButton
├── BathButton
├── PlayButton
└── BottomNav
```

## 1. 创建场景

1. 打开 Cocos Creator。
2. 在 `assets` 目录下新建 `scenes` 文件夹。
3. 右键 `scenes` → Create → Scene。
4. 命名为 `Home.scene`。
5. 双击打开 `Home.scene`。

## 2. 设置 Canvas

1. 层级管理器里默认会有 `Canvas`。
2. 选中 `Canvas`。
3. 确认有 `Canvas` 组件。
4. 建议设计分辨率设置为：
   - Width: `750`
   - Height: `1600`
5. 如果项目面板有 Fit Width / Fit Height：
   - 手机竖屏项目建议 Fit Width 开启。

## 3. 创建 Bg 背景

1. 右键 `Canvas` → Create → UI Node → Sprite。
2. 命名为 `Bg`。
3. 选中 `Bg`。
4. 设置位置：
   - X: `0`
   - Y: `0`
5. 设置大小：
   - W: `750`
   - H: `1600`
6. 给 Sprite 设置纯色背景，建议颜色：`#FFF6EC`。
7. 把 `Bg` 拖到 Canvas 子节点最上面，保证它在最底层显示。

## 4. 创建 TopBar

1. 右键 `Canvas` → Create → Empty Node。
2. 命名为 `TopBar`。
3. 设置位置：
   - X: `0`
   - Y: `700`
4. 设置大小：
   - W: `690`
   - H: `100`

### CoinLabel

1. 右键 `TopBar` → Create → UI Node → Label。
2. 命名为 `CoinLabel`。
3. 设置位置：
   - X: `-210`
   - Y: `0`
4. Label 文本填：`金币：0`。
5. 字号：`28`。
6. 颜色：`#7A3A10`。

### DiamondLabel

1. 右键 `TopBar` → Create → UI Node → Label。
2. 命名为 `DiamondLabel`。
3. 设置位置：
   - X: `210`
   - Y: `0`
4. Label 文本填：`钻石：0`。
5. 字号：`28`。
6. 颜色：`#7A3A10`。

## 5. 创建 PetArea

1. 右键 `Canvas` → Create → Empty Node。
2. 命名为 `PetArea`。
3. 设置位置：
   - X: `0`
   - Y: `150`
4. 设置大小：
   - W: `690`
   - H: `700`

### PetSprite

1. 右键 `PetArea` → Create → UI Node → Sprite。
2. 命名为 `PetSprite`。
3. 设置位置：
   - X: `0`
   - Y: `140`
4. 设置大小：
   - W: `260`
   - H: `260`
5. 暂时没有宠物图时，可以先用一个圆形或默认 Sprite 占位。

### PetNameLabel

1. 右键 `PetArea` → Create → UI Node → Label。
2. 命名为 `PetNameLabel`。
3. 设置位置：
   - X: `0`
   - Y: `-40`
4. Label 文本填：`宠物：布丁`。
5. 字号：`36`。
6. 颜色：`#1F2937`。

### PetInfoLabel

1. 右键 `PetArea` → Create → UI Node → Label。
2. 命名为 `PetInfoLabel`。
3. 设置位置：
   - X: `0`
   - Y: `-130`
4. Label 文本填：

```text
等级：1
经验：0
饥饿：60
清洁：60
心情：60
```

5. 字号：`24`。
6. 行高建议：`34`。
7. 颜色：`#6B7280`。

## 6. 创建 StatusLabel

1. 右键 `Canvas` → Create → UI Node → Label。
2. 命名为 `StatusLabel`。
3. 设置位置：
   - X: `0`
   - Y: `-290`
4. Label 文本填：`准备连接服务器...`。
5. 字号：`24`。
6. 颜色：`#B6480C`。

## 7. 创建三个按钮

### FeedButton

1. 右键 `Canvas` → Create → UI Node → Button。
2. 命名为 `FeedButton`。
3. 设置位置：
   - X: `-220`
   - Y: `-450`
4. 设置大小：
   - W: `180`
   - H: `72`
5. 找到按钮下面的 Label，文本改成：`喂食`。

### BathButton

1. 右键 `Canvas` → Create → UI Node → Button。
2. 命名为 `BathButton`。
3. 设置位置：
   - X: `0`
   - Y: `-450`
4. 设置大小：
   - W: `180`
   - H: `72`
5. Label 文本改成：`洗澡`。

### PlayButton

1. 右键 `Canvas` → Create → UI Node → Button。
2. 命名为 `PlayButton`。
3. 设置位置：
   - X: `220`
   - Y: `-450`
4. 设置大小：
   - W: `180`
   - H: `72`
5. Label 文本改成：`玩耍`。

## 8. 创建 BottomNav

1. 右键 `Canvas` → Create → Empty Node。
2. 命名为 `BottomNav`。
3. 设置位置：
   - X: `0`
   - Y: `-720`
4. 设置大小：
   - W: `750`
   - H: `120`
5. 后续再在里面添加首页、任务、背包、商城、我的几个按钮。

## 9. 挂载脚本

1. 选中 `Canvas`。
2. 在 Inspector 里点击 Add Component。
3. 搜索并添加 `HomeScene`。
4. 把节点拖到脚本属性上：
   - `coinLabel` ← `CoinLabel`
   - `diamondLabel` ← `DiamondLabel`
   - `petNameLabel` ← `PetNameLabel`
   - `petInfoLabel` ← `PetInfoLabel`
   - `statusLabel` ← `StatusLabel`

## 10. 绑定按钮事件

以 `FeedButton` 为例：

1. 选中 `FeedButton`。
2. 找到 Button 组件。
3. Click Events 数量设置为 `1`。
4. 把 `Canvas` 拖入事件目标。
5. Component 选择 `HomeScene`。
6. Handler 选择 `onClickFeed`。

另外两个按钮：

- `BathButton` → `HomeScene.onClickBath`
- `PlayButton` → `HomeScene.onClickPlay`

## 11. 运行前准备

先启动 PHP 后端：

```bash
cd pet-game-server
php -S 127.0.0.1:8000 -t public
```

再运行 Cocos 预览。

成功状态：

```text
服务器连接成功
金币、钻石、宠物信息正常显示
点击喂食/洗澡/玩耍后数值变化
```
