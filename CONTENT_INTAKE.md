# Wormforce 官网内容填写清单

填写说明：
- 请直接在本文件中把 `TODO` 改成你的真实信息。
- 没有的内容先写 `TBD`，我会按你已填部分先替换上线。
- 链接请写完整 URL（例如 `https://...`，邮箱用 `mailto:...`）。
- `slug` 只能用小写英文、数字、连字符（例如 `quanbo-zhao`）。

---

## 1) 团队信息（必填）

```yaml
team:
  name: "TODO"                     # 例如 Wormforce
  tagline: "TODO"                  # 首页主标语（一句话）
  description: "TODO"              # 团队介绍（1-3句）
  mission: "TODO"                  # 团队使命（1-2句）
  contact_email: "TODO"            # 例如 team@wormforce.net

  social_links:
    - label: "GitHub"
      url: "TODO"                  # 例如 https://github.com/7b7b7b/wormforce
    - label: "X"
      url: "TODO"                  # 例如 https://x.com/your_handle
    - label: "Email"
      url: "TODO"                  # 例如 mailto:team@wormforce.net
```

---

## 2) 三位成员信息（必填）

```yaml
members:
  - slug: "TODO-member-1"
    name: "TODO"
    role: "TODO"
    short_bio: "TODO"              # 卡片短介绍（1句）
    full_bio: "TODO"               # 详情页长介绍（2-5句）
    avatar_file: "/images/members/member-1.jpg"
    skills:
      - "TODO"
      - "TODO"
      - "TODO"
      - "TODO"
      - "TODO"
    links:
      - label: "GitHub"
        url: "TODO"
      - label: "LinkedIn"
        url: "TODO"
      - label: "X"
        url: "TODO"
      - label: "Email"
        url: "TODO"

  - slug: "TODO-member-2"
    name: "TODO"
    role: "TODO"
    short_bio: "TODO"
    full_bio: "TODO"
    avatar_file: "/images/members/member-2.jpg"
    skills:
      - "TODO"
      - "TODO"
      - "TODO"
      - "TODO"
      - "TODO"
    links:
      - label: "GitHub"
        url: "TODO"
      - label: "LinkedIn"
        url: "TODO"
      - label: "X"
        url: "TODO"
      - label: "Email"
        url: "TODO"

  - slug: "TODO-member-3"
    name: "TODO"
    role: "TODO"
    short_bio: "TODO"
    full_bio: "TODO"
    avatar_file: "/images/members/member-3.jpg"
    skills:
      - "TODO"
      - "TODO"
      - "TODO"
      - "TODO"
      - "TODO"
    links:
      - label: "GitHub"
        url: "TODO"
      - label: "LinkedIn"
        url: "TODO"
      - label: "X"
        url: "TODO"
      - label: "Email"
        url: "TODO"
```

---

## 3) 头像素材对应（必填）

请把三张正式头像放到以下路径（替换现有占位图）：
- `public/images/members/member-1.jpg`
- `public/images/members/member-2.jpg`
- `public/images/members/member-3.jpg`

建议：
- 尺寸：至少 `800x800`
- 比例：`1:1` 或接近正方形
- 文件大小：每张尽量 < 500KB

---

## 4) 可选项（有就填）

```yaml
optional:
  projects_status_text: "TODO or TBD"   # Projects 页占位文案
  seo_keywords:
    - "TODO"
    - "TODO"
    - "TODO"
  footer_note: "TODO or TBD"            # 页脚补充文案
```

---

## 5) 你填完后怎么告诉我

你填完后只要回一句：

`CONTENT_INTAKE.md 已填好，请按这个文件替换网站内容并 push`

我会：
1. 按该文件同步更新 `src/content/site.ts` 和 `src/content/members.ts`（以及相关固定文案）。
2. 检查构建通过。
3. 直接提交并 push 到 `main`。
