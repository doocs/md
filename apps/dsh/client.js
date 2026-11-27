/**
 * @description: 浏览器半片：侧边栏入口「doocs/md」+ 完整编辑器面板
 *
 * 面板只是宿主皮肤里的一层外框：编辑器本体是 `apps/web` 的原样构建产物，
 * 由 Host 半片挂在 `/md-wechat/editor/`，整页嵌在 iframe 里 —— 主题、排版、
 * 代码高亮、复制/导出流程全部保持上游行为，插件不重写任何排版逻辑。
 */
window.__ModuleLoader__.load({
  id: `@doocs/dsh-md`,
  factory(require) {
    const React = require(`react`)
    const h = React.createElement
    const { useCallback, useEffect, useState } = React

    /** 主面板 key / 侧边栏 id（两者必须一致，owner 靠它把图标和面板对上） */
    const PANEL_ID = `md-wechat`
    const EDITOR_PATH = `/md-wechat/editor/`
    const LOCALE_NS = `md-wechat`

    const DICTS = {
      'zh': {
        title: `doocs/md`,
        heading: `微信 Markdown 编辑器`,
        reload: `刷新`,
        frameTitle: `微信 Markdown 编辑器`,
        checking: `正在加载编辑器…`,
        missing: `编辑器路由还没就绪（Host 仍是旧模块）。重启一次 DSH 后刷新页面即可；确认 dist/editor 存在可跑 pnpm dsh:check。`,
        retry: `再试一次`,
      },
      'en': {
        title: `doocs/md`,
        heading: `WeChat Markdown Editor`,
        reload: `Refresh`,
        frameTitle: `WeChat Markdown Editor`,
        checking: `Loading editor…`,
        missing: `The editor route is not ready (the Host still runs the previous module). Restart DSH once, then refresh.`,
        retry: `Try again`,
      },
      'zh-TW': {
        title: `doocs/md`,
        heading: `微信 Markdown 編輯器`,
        reload: `重新整理`,
        frameTitle: `微信 Markdown 編輯器`,
        checking: `正在載入編輯器…`,
        missing: `編輯器路由還沒就緒（Host 仍是舊模組）。重啟一次 DSH 後重新整理頁面即可。`,
        retry: `再試一次`,
      },
      'ja': {
        title: `doocs/md`,
        heading: `微信 Markdown エディター`,
        reload: `更新`,
        frameTitle: `微信 Markdown エディター`,
        checking: `エディターを読み込み中…`,
        missing: `エディターのルートがまだ準備できていません（Host が古いモジュールのままです）。DSH を再起動してからページを更新してください。`,
        retry: `再試行`,
      },
      'es': {
        title: `doocs/md`,
        heading: `Editor Markdown de WeChat`,
        reload: `Actualizar`,
        frameTitle: `Editor Markdown de WeChat`,
        checking: `Cargando el editor…`,
        missing: `La ruta del editor aún no está lista (el Host sigue con el módulo anterior). Reinicia DSH y actualiza la página.`,
        retry: `Reintentar`,
      },
      'fr': {
        title: `doocs/md`,
        heading: `Éditeur Markdown WeChat`,
        reload: `Actualiser`,
        frameTitle: `Éditeur Markdown WeChat`,
        checking: `Chargement de l’éditeur…`,
        missing: `La route de l’éditeur n’est pas prête (le Host utilise encore l’ancien module). Redémarrez DSH, puis actualisez la page.`,
        retry: `Réessayer`,
      },
      'de': {
        title: `doocs/md`,
        heading: `WeChat-Markdown-Editor`,
        reload: `Aktualisieren`,
        frameTitle: `WeChat-Markdown-Editor`,
        checking: `Editor wird geladen…`,
        missing: `Die Editor-Route ist noch nicht bereit (der Host nutzt noch das alte Modul). Starte DSH neu und lade die Seite neu.`,
        retry: `Erneut versuchen`,
      },
      'ru': {
        title: `doocs/md`,
        heading: `Markdown-редактор WeChat`,
        reload: `Обновить`,
        frameTitle: `Markdown-редактор WeChat`,
        checking: `Загрузка редактора…`,
        missing: `Маршрут редактора ещё не готов (Host всё ещё использует старый модуль). Перезапустите DSH и обновите страницу.`,
        retry: `Повторить`,
      },
      'pt': {
        title: `doocs/md`,
        heading: `Editor Markdown do WeChat`,
        reload: `Atualizar`,
        frameTitle: `Editor Markdown do WeChat`,
        checking: `A carregar o editor…`,
        missing: `A rota do editor ainda não está pronta (o Host ainda usa o módulo anterior). Reinicie o DSH e atualize a página.`,
        retry: `Tentar novamente`,
      },
    }

    /**
     * DSH 语言 id（zh / en / ja / es / fr / de / ru / pt，也接受地区后缀）对应面板文案。
     * 没有文案的语言跟 DSH 一样回落到英文。
     * @param {string} tag 宿主语言
     * @returns {string} DICTS 的 key
     */
    function toChromeLocale(tag) {
      const value = String(tag || ``).toLowerCase().replace(/_/g, `-`)

      if (value === `zh-tw` || value === `zh-hk` || value === `zh-mo` || value.startsWith(`zh-hant`))
        return `zh-TW`
      if (value.startsWith(`zh`))
        return `zh`
      if (value.startsWith(`ja`))
        return `ja`
      if (value.startsWith(`es`))
        return `es`
      if (value.startsWith(`fr`))
        return `fr`
      if (value.startsWith(`de`))
        return `de`
      if (value.startsWith(`ru`))
        return `ru`
      if (value.startsWith(`pt`))
        return `pt`
      if (value.startsWith(`en`))
        return `en`
      return `en`
    }

    /**
     * Host language id to the editor locale. Unknown tags fall back to English.
     * @param {string} tag host language
     * @returns {'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ru-RU' | 'pt-BR'} editor locale
     */
    function toEditorLocale(tag) {
      const chrome = toChromeLocale(tag)

      if (chrome === `zh-TW`)
        return `zh-TW`
      if (chrome === `zh`)
        return `zh-CN`
      if (chrome === `ja`)
        return `ja-JP`
      if (chrome === `es`)
        return `es-ES`
      if (chrome === `fr`)
        return `fr-FR`
      if (chrome === `de`)
        return `de-DE`
      if (chrome === `ru`)
        return `ru-RU`
      if (chrome === `pt`)
        return `pt-BR`
      return `en-US`
    }

    let editorLocaleTag = `zh-CN`
    let activeLocale = `zh`
    let editorFrame = null
    const localeListeners = new Set()

    /** 告诉已打开的编辑器切换语言，不重载 iframe */
    function pushEditorLocale() {
      editorFrame?.contentWindow?.postMessage(
        { type: `doocs-md:set-locale`, locale: editorLocaleTag },
        window.location.origin,
      )
    }

    function notifyLocale() {
      for (const listener of localeListeners)
        listener()
    }

    /**
     * 取文案
     * @param {string} key 词条
     * @returns {string} 文案
     */
    function t(key) {
      return DICTS[activeLocale]?.[key] ?? DICTS.zh[key] ?? key
    }

    const styles = {
      root: {
        display: `flex`,
        flexDirection: `column`,
        height: `100%`,
        minHeight: 0,
        background: `var(--dsw-alias-bg-base)`,
        color: `var(--dsw-alias-label-primary)`,
      },
      header: {
        display: `flex`,
        alignItems: `center`,
        gap: 8,
        padding: `6px 12px`,
        borderBottom: `1px solid var(--dsw-alias-border-l1)`,
        background: `var(--dsw-alias-bg-layer-1)`,
      },
      title: { fontSize: 13, fontWeight: 600, color: `var(--dsw-alias-label-primary)`, marginRight: `auto` },
      button: {
        height: 26,
        padding: `0 10px`,
        borderRadius: 6,
        border: `1px solid var(--dsw-alias-border-l1)`,
        background: `var(--dsw-alias-bg-base)`,
        color: `var(--dsw-alias-label-primary)`,
        fontSize: 12,
        cursor: `pointer`,
      },
      frameWrap: { flex: 1, minHeight: 0, position: `relative`, background: `var(--dsw-alias-bg-base)` },
      frame: { width: `100%`, height: `100%`, border: 0, display: `block`, background: `#fff` },
      missing: {
        position: `absolute`,
        inset: 0,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
        padding: 24,
        fontSize: 13,
        color: `var(--dsw-alias-label-secondary)`,
        textAlign: `center`,
      },
      missingText: { fontSize: 13, lineHeight: 1.7, marginBottom: 12, maxWidth: 460 },
    }

    /**
     * 侧边栏图标（文档 + 发布箭头）
     * @param {{size?: number, active?: boolean}} props 由 owner 传入
     * @returns {import('react').ReactElement} 图标
     */
    function SidebarIcon({ size = 20, active = false }) {
      return h(
        `svg`,
        {
          'width': size,
          'height': size,
          'viewBox': `0 0 36 36`,
          'fill': `none`,
          'stroke': `currentColor`,
          'strokeWidth': 2.4,
          'strokeLinecap': `round`,
          'strokeLinejoin': `round`,
          'opacity': active ? 1 : 0.72,
          'aria-hidden': `true`,
          'style': { display: `block` },
        },
        h(`rect`, { x: 6, y: 4, width: 18, height: 22, rx: 3 }),
        h(`path`, { d: `M11 10h8M11 15h8M11 20h5` }),
        h(`circle`, { cx: 26, cy: 26, r: 6, fill: `currentColor`, stroke: `none` }),
        h(`path`, { d: `M23.6 26h4.8M26.4 23.9L28.4 26l-2 2.1`, stroke: `var(--dsw-alias-bg-base)` }),
      )
    }

    /** 主面板：只负责外框与 iframe */
    function Panel() {
      // 递增的 key 用来强制 iframe 重新加载
      const [revision, setRevision] = useState(0)
      // checking：探测路由；ok：嵌入编辑器；missing：路由没就绪（通常是 Host 旧模块）
      const [health, setHealth] = useState(`checking`)
      // 宿主切语言时重绘标题。首次 src 带上 locale，之后只 postMessage，避免整页重载。
      const [, setLocaleTick] = useState(0)
      const [editorSrc] = useState(() => `${EDITOR_PATH}?locale=${encodeURIComponent(editorLocaleTag)}`)

      const reload = useCallback(() => {
        setRevision(current => current + 1)
      }, [])

      useEffect(() => {
        const listener = () => setLocaleTick(tick => tick + 1)
        localeListeners.add(listener)
        return () => localeListeners.delete(listener)
      }, [])

      // 先探接口再渲染 iframe：比「等 iframe 超时」可靠，也不会把正常加载误判成失败
      useEffect(() => {
        let alive = true

        setHealth(`checking`)

        fetch(EDITOR_PATH, { headers: { accept: `text/html` } })
          .then((response) => {
            if (alive)
              setHealth(response.ok ? `ok` : `missing`)
          })
          .catch(() => {
            if (alive)
              setHealth(`missing`)
          })

        return () => {
          alive = false
        }
      }, [revision])

      return h(
        `div`,
        { style: styles.root },
        h(
          `div`,
          { style: styles.header },
          h(`span`, { style: styles.title }, t(`heading`)),
          h(`button`, { type: `button`, style: styles.button, onClick: reload }, t(`reload`)),
        ),
        h(
          `div`,
          { style: styles.frameWrap },
          health === `missing`
            ? h(
                `div`,
                { style: styles.missing },
                h(
                  `div`,
                  null,
                  h(`p`, { style: styles.missingText }, t(`missing`)),
                  h(`button`, { type: `button`, style: styles.button, onClick: reload }, t(`retry`)),
                ),
              )
            : h(`iframe`, {
                key: revision,
                ref: (node) => {
                  editorFrame = node
                },
                style: styles.frame,
                title: t(`frameTitle`),
                src: editorSrc,
                onLoad: () => {
                  setHealth(`ok`)
                  // 编辑器要等 bootstrap 装上监听，加载完成后再补推几次
                  pushEditorLocale()
                  setTimeout(pushEditorLocale, 400)
                  setTimeout(pushEditorLocale, 1200)
                },
              }),
          health === `checking`
            ? h(`div`, { style: styles.missing }, h(`span`, null, t(`checking`)))
            : null,
        ),
      )
    }

    /**
     * 注册文案字典并跟随宿主语言
     * @param {object} ctx Client 上下文
     * @returns {void}
     */
    function setupLocale(ctx) {
      const locale = ctx.get(`locale`)

      if (!locale)
        return

      for (const [id, dict] of Object.entries(DICTS)) {
        try {
          ctx.effect(() => locale.register(LOCALE_NS, id, dict), `md-wechat: locale ${id}`)
        }
        catch {
          // 语言未注册时保持中文
        }
      }

      const applyActive = () => {
        try {
          const snapshot = locale.getLocale()
          const tag = typeof snapshot === `string`
            ? snapshot
            : snapshot?.active || snapshot?.locale || ``

          if (tag) {
            editorLocaleTag = toEditorLocale(tag)
            activeLocale = toChromeLocale(tag)
          }
        }
        catch {
          // 忽略：保持当前语言
        }

        notifyLocale()
        pushEditorLocale()
      }

      applyActive()
      ctx.effect(() => locale.subscribe(applyActive), `md-wechat: locale subscription`)
    }

    return {
      inject: [`slots`],
      apply(ctx) {
        setupLocale(ctx)

        // 主面板：key 与侧边栏 id 一致，点图标就切到本面板
        ctx.slots.inject(`main`, () =>
          ctx.slots.register({ name: `main`, key: PANEL_ID }, Panel),
        )

        // 侧边栏入口
        ctx.slots.inject(`sidebar.panellist`, () =>
          ctx.slots.register(
            { name: `sidebar.panellist`, id: PANEL_ID, order: 7, label: () => t(`title`) },
            SidebarIcon,
          ),
        )
      },
    }
  },
})
