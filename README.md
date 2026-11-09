# Optical Archive

一个个人作品集网站模板：一台复古胶片阅读机。电脑上是可交互的 3D 场景（three.js），手机和不支持 3D 的浏览器自动进入同风格的 2D 简洁版。支持中、英两种语言。

现在仓库里的名字、简介、项目、技能和证书都是占位内容，换成你自己的即可（见下文「改内容」）。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 单元测试
npm run build      # 产出 dist/
npm run preview    # 预览打包结果
```

想在电脑上看 2D 版：点右上角「Simple View」，或在浏览器控制台执行 `localStorage.setItem('oa:view', '"2d"')` 后刷新（改回 `"3d"` 即恢复）。

## 改内容（不用碰代码）

所有内容都在 **`src/content/content.json`**：

| 字段 | 内容 |
|---|---|
| `profile` | 名字、职位（可省略）、简介段落、照片（可写 `null`）、联系方式（邮箱和电话带复制按钮）、教育背景、兴趣方向 |
| `projectCategories` | 项目分类：`id`、编号前缀、名称、一句话简介。Projects 页先显示分类，点进去是该分类下的项目 |
| `projects` | 项目列表：编号、所属分类 `category`（填分类的 `id`）、名称、一句话简介、详细介绍、图片、技术栈（填技能的 `id`）、GitHub/演示链接（没有就写 `null`） |
| `skills` | 技能分组，每个技能有 `id`、名称、熟练度 `level`（1–5）、年限、说明 |
| `certificates` | 证书：名称、图标字符、`status`（`earned` 已获得 / `in-progress` 准备中）、颁发机构、日期、编号、验证链接 |

- 文字可以只写英文字符串，也可以写成 `{ "en": "...", "zh": "..." }`。缺哪种语言就自动显示英文。
- 图片放进 `public/images/`，数据里写 `images/文件名`。
- 改完运行 `npm test`：其中一项测试会检查数据格式（比如漏了英文、`status` 写错、技术栈引用了不存在的技能），有问题会直接指出是哪一条。

界面上的固定文字（导航、按钮、开场那句问题等，其中开场问题 `intro.question` 里也有名字，记得一起改）在 **`src/content/strings.json`**，同样是中英键值表。

## 常用调整

都在 **`src/config.js`**：

- `SCREEN_COVER`：载入后屏幕占画面宽度的比例，默认 `0.75`。
- `FILM`：卷胶片的手感（惯性衰减、吸附弹簧强度、回弹程度、滚轮灵敏度）。
- `TIMING`：旋钮转动、屏幕推近、退出的时长。
- `CAMERA`、`REEL`、`SCREEN`、`RIG`、`CONSOLE`、`LAMP`、`STRIP_END`：场景布局。

## 发布

推送到 GitHub 的 `main` 分支后，`.github/workflows/deploy.yml` 会自动测试、打包并发布到 GitHub Pages。

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
2. 发布路径会按仓库名自动设置：仓库叫 `<用户名>.github.io` 时网址是 `https://<用户名>.github.io/`；叫别的名字（比如 `portfolio`）时网址是 `https://<用户名>.github.io/portfolio/`。以后绑定自己的域名时，在 Settings → Variables 里加仓库变量 `BASE_PATH=/` 即可。

## 3D 场景

场景里的机器（屏幕、悬挂机械臂、转轮、导轮闸、旋钮面板、吊灯）全部用代码生成，没有外部模型文件。

## 其他

- `index.html` 里的标题和分享描述、`public/og.png`（分享时显示的预览图）也写着占位名字，发布前换成你自己的。

## 许可证

[MIT](LICENSE)：可以自由使用、修改和发布，只需保留许可证里的版权声明。
