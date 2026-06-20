import type { AppLocale } from '@/i18n/types'

const EXAMPLES: Record<AppLocale, Record<string, string>> = {
  'zh-CN': {
    MpProfile: `<MpProfile mpId="MzIxNjA5ODQ0OQ==" nickname="Doocs" headimg="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png" signature="GitHub 开源组织" serviceType="1" verifyStatus="1" />`,
    QRCodeBlock: `<QRCodeBlock url="https://md.doocs.org" text="扫码访问" size="150" />`,
    AuthorBlock: `<AuthorBlock name="yanglbme" avatar="https://avatars.githubusercontent.com/u/21008209?v=4" bio="Doocs 创建者" />`,
    TipBlock: `<TipBlock type="info" title="提示" content="这是一条提示信息" />`,
    TableBlock: `<TableBlock headers='["名称","版本","状态"]' rows='[["Vue","3.x","✅ 稳定"],["Vite","8.x","✅ 稳定"],["pnpm","10.x","✅ 稳定"]]' caption="技术栈清单" />`,
    InfoGrid: `<InfoGrid items='[{"label":"作者","value":"yanglbme"},{"label":"版本","value":"v1.0"},{"label":"许可证","value":"MIT"},{"label":"语言","value":"TypeScript"}]' cols="2" />`,
    BadgeGroup: `<BadgeGroup tags='["Vue 3","TypeScript","Vite","Tailwind CSS"]' color="#07c160" />`,
  },
  'en-US': {
    MpProfile: `<MpProfile mpId="MzIxNjA5ODQ0OQ==" nickname="Doocs" headimg="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png" signature="Open-source organization on GitHub" serviceType="1" verifyStatus="1" />`,
    QRCodeBlock: `<QRCodeBlock url="https://md.doocs.org" text="Scan to visit" size="150" />`,
    AuthorBlock: `<AuthorBlock name="yanglbme" avatar="https://avatars.githubusercontent.com/u/21008209?v=4" bio="Creator of Doocs" />`,
    TipBlock: `<TipBlock type="info" title="Tip" content="This is a tip message" />`,
    TableBlock: `<TableBlock headers='["Name","Version","Status"]' rows='[["Vue","3.x","✅ Stable"],["Vite","8.x","✅ Stable"],["pnpm","10.x","✅ Stable"]]' caption="Tech stack" />`,
    InfoGrid: `<InfoGrid items='[{"label":"Author","value":"yanglbme"},{"label":"Version","value":"v1.0"},{"label":"License","value":"MIT"},{"label":"Language","value":"TypeScript"}]' cols="2" />`,
    BadgeGroup: `<BadgeGroup tags='["Vue 3","TypeScript","Vite","Tailwind CSS"]' color="#07c160" />`,
  },
}

export function getBuiltinComponentExample(locale: AppLocale, name: string, fallback?: string): string | undefined {
  return EXAMPLES[locale]?.[name] ?? fallback
}
