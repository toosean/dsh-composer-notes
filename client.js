window.__ModuleLoader__.load({
  id: '@local/composer-notes',
  factory(require) {
    const React = require('react')
    const { createPortal } = require('react-dom')
    const h = React.createElement
    const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React

    const NS = 'composer-notes'
    const SETTINGS_NS = 'composer-notes'
    const STORAGE_KEY = 'dsh.composer-notes.notes'
    const MENU_MAX_HEIGHT = 320

    let idSeq = 0
    function useLocalId(prefix) {
      const ref = useRef(null)
      if (ref.current === null) {
        idSeq += 1
        ref.current = `${prefix}-${idSeq}`
      }
      return ref.current
    }

    const zh = {
      'button.label': '笔记',
      'menu.empty': '暂无笔记',
      'menu.loading': '正在加载笔记…',
      'menu.new': '新建笔记',
      'error.insert': '当前无法插入到消息输入框，请稍后再试。',
      'error.remove': '内容已插入，但笔记删除失败。',
      'error.save': '笔记保存失败，请重试。',
      'error.readOnly': '当前 profile 不允许保存笔记。',
      'dialog.title': '新建笔记',
      'dialog.placeholder': '写下笔记内容…',
      'dialog.hint': '保存后可从笔记菜单插入到消息输入框；插入后该笔记会自动删除。',
      'dialog.cancel': '取消',
      'dialog.save': '保存笔记',
      'dialog.saving': '正在保存…',
    }

    const en = {
      'button.label': 'Note',
      'menu.empty': 'No notes yet',
      'menu.loading': 'Loading notes…',
      'menu.new': 'New note',
      'error.insert': "Can't insert into the message input right now. Try again in a moment.",
      'error.remove': 'The text was inserted, but the note could not be deleted.',
      'error.save': 'The note could not be saved. Try again.',
      'error.readOnly': 'This profile does not allow saving notes.',
      'dialog.title': 'New note',
      'dialog.placeholder': 'Write a note…',
      'dialog.hint': 'Saved notes can be inserted from the note menu; a note is removed after it is inserted.',
      'dialog.cancel': 'Cancel',
      'dialog.save': 'Save note',
      'dialog.saving': 'Saving…',
    }

    const CSS = `
.dsh-cn-root { display: inline-flex; align-items: center; min-width: 0; }
.dsh-cn-trigger {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  max-width: 200px;
  min-width: 0;
  padding: 0 6px 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  outline: none;
}
@media (hover: hover) {
  .dsh-cn-trigger:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2)); }
}
.dsh-cn-trigger:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.dsh-cn-trigger:disabled { opacity: 0.5; cursor: default; }
.dsh-cn-triggerIcon { flex: none; display: inline-flex; width: 14px; height: 14px; }
.dsh-cn-triggerIcon svg { display: block; width: 14px; height: 14px; }
.dsh-cn-triggerLabel { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-cn-chevron { flex: none; display: inline-flex; color: var(--dsw-alias-label-tertiary); transition: transform 0.12s ease; }
.dsh-cn-chevron[data-open="true"] { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) { .dsh-cn-chevron { transition: none; } }
.dsh-cn-menu {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-prominent, 0 8px 24px rgba(0, 0, 0, 0.18));
  color: var(--dsw-alias-label-primary);
  overflow-y: auto;
  overscroll-behavior: contain;
}
.dsh-cn-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) {
  .dsh-cn-item:hover { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2)); }
}
.dsh-cn-item:focus-visible { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2)); outline: none; }
.dsh-cn-itemIcon { flex: none; display: inline-flex; width: 14px; height: 14px; color: var(--dsw-alias-label-tertiary); }
.dsh-cn-itemIcon svg { display: block; width: 14px; height: 14px; }
.dsh-cn-new .dsh-cn-itemIcon { color: var(--dsw-alias-brand-primary); }
.dsh-cn-itemText { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-cn-divider { height: 0; margin: 4px; border-top: 0.5px solid var(--dsw-alias-border-l1); }
.dsh-cn-note { padding: 8px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-cn-error { padding: 6px 8px; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.dsh-cn-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--dsw-alias-bg-mask-1, rgba(0, 0, 0, 0.32));
}
.dsh-cn-dialog {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(560px, 100%);
  max-height: calc(100vh - 32px);
  padding: 20px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 16px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-prominent, 0 12px 32px rgba(0, 0, 0, 0.2));
  color: var(--dsw-alias-label-primary);
}
.dsh-cn-dialogTitle { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; }
.dsh-cn-dialogHint { margin: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-cn-dialogError { margin: 0; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.dsh-cn-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 240px;
  max-height: 50vh;
  padding: 12px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  outline: none;
  resize: vertical;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
}
.dsh-cn-textarea::placeholder { color: var(--dsw-alias-label-tertiary); }
.dsh-cn-textarea:focus { border-color: var(--dsw-alias-brand-primary); }
.dsh-cn-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.dsh-cn-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}
.dsh-cn-button:disabled { opacity: 0.5; cursor: default; }
.dsh-cn-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.dsh-cn-secondary { border: 0.5px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-primary); }
@media (hover: hover) { .dsh-cn-secondary:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); } }
.dsh-cn-primary { border: 0; background: var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary)); color: var(--dsw-alias-label-primary-inverted); }
@media (hover: hover) { .dsh-cn-primary:hover:not(:disabled) { filter: brightness(0.96); } }
@media (max-width: 560px) {
  .dsh-cn-triggerLabel { display: none; }
  .dsh-cn-trigger { padding: 0 6px; }
}
`

    function noteSvg() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: 'false' },
        h('path', {
          d: 'M4 1.75h6.2L13.25 4.8V13A1.25 1.25 0 0 1 12 14.25H4A1.25 1.25 0 0 1 2.75 13V3A1.25 1.25 0 0 1 4 1.75Z',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M10 1.9V5h3.15',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M5 8h6M5 10.5h4',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
        }),
      )
    }

    function plusSvg() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: 'false' },
        h('path', {
          d: 'M8 3.25v9.5M3.25 8h9.5',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
      )
    }

    function chevronSvg() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true, focusable: 'false' },
        h('path', {
          d: 'M4 6.25 8 10.25l4-4',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function createId() {
      try {
        if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
          return globalThis.crypto.randomUUID()
        }
      } catch (_error) {
        /* fall through to the local id */
      }
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    }

    function parseNotes(raw) {
      let value = raw
      if (typeof value === 'string') {
        if (value.trim() === '') return []
        try {
          value = JSON.parse(value)
        } catch (_error) {
          return []
        }
      }
      if (!Array.isArray(value)) return []
      const notes = []
      for (const entry of value) {
        if (entry === null || typeof entry !== 'object') continue
        if (typeof entry.text !== 'string' || entry.text.trim() === '') continue
        notes.push({
          id: typeof entry.id === 'string' && entry.id !== '' ? entry.id : createId(),
          text: entry.text,
          createdAt:
            typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt) ? entry.createdAt : 0,
        })
      }
      return notes
    }

    function sameNotes(left, right) {
      if (left === right) return true
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
      for (let index = 0; index < left.length; index += 1) {
        if (
          left[index].id !== right[index].id ||
          left[index].text !== right[index].text ||
          left[index].createdAt !== right[index].createdAt
        ) {
          return false
        }
      }
      return true
    }

    function readLocalNotes() {
      try {
        return parseNotes(window.localStorage.getItem(STORAGE_KEY))
      } catch (_error) {
        return []
      }
    }

    function writeLocalNotes(notes) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
        return true
      } catch (_error) {
        return false
      }
    }

    function previewOf(text) {
      const line =
        text
          .split(/\r?\n/u)
          .map((part) => part.trim())
          .find((part) => part !== '') || text.trim()
      const collapsed = line.replace(/\s+/gu, ' ')
      return collapsed.length > 180 ? `${collapsed.slice(0, 177)}…` : collapsed
    }

    /**
     * Notes store. The Host settings form is the durable primary backend; the
     * browser-local list keeps the feature usable when that form is absent.
     * @param ctx - restricted Client plugin context.
     * @returns Store API consumed by the slot component.
     */
    function createNotesStore(ctx) {
      let scope
      try {
        const configForms = typeof ctx.get === 'function' ? ctx.get('configForms') : undefined
        if (configForms !== undefined && typeof configForms.get === 'function') {
          scope = configForms.get(SETTINGS_NS)
        }
      } catch (_error) {
        scope = undefined
      }

      let mode = scope === undefined ? 'local' : 'config'
      let state =
        mode === 'local'
          ? { notes: readLocalNotes(), status: 'ready', writable: true, durable: false }
          : { notes: [], status: 'loading', writable: false, durable: true }
      const listeners = new Set()
      let unsubscribe
      let disposed = false

      function publish(next) {
        if (disposed) return
        if (
          state.status === next.status &&
          state.writable === next.writable &&
          state.durable === next.durable &&
          sameNotes(state.notes, next.notes)
        ) {
          return
        }
        state = next
        for (const listener of [...listeners]) {
          try {
            listener()
          } catch (_error) {
            /* one subscriber must not break the store */
          }
        }
      }

      function switchToLocal() {
        scope = undefined
        mode = 'local'
        publish({ notes: readLocalNotes(), status: 'ready', writable: true, durable: false })
      }

      function derive() {
        if (disposed || scope === undefined) return
        let snapshot
        try {
          snapshot = scope.getSnapshot()
        } catch (_error) {
          switchToLocal()
          return
        }
        if (snapshot.status === 'unavailable') {
          switchToLocal()
          return
        }
        if (snapshot.status !== 'ready') {
          publish({ notes: state.notes, status: 'loading', writable: false, durable: true })
          return
        }
        publish({
          notes: parseNotes(snapshot.value === undefined ? undefined : snapshot.value.notes),
          status: 'ready',
          writable: snapshot.writable === true,
          durable: true,
        })
      }

      if (scope !== undefined) {
        try {
          if (typeof scope.subscribe === 'function') unsubscribe = scope.subscribe(derive)
          derive()
        } catch (_error) {
          switchToLocal()
        }
      }

      async function add(text) {
        if (typeof text !== 'string' || text.trim() === '') return { ok: false, code: 'empty' }
        if (mode === 'config' && scope !== undefined) {
          let snapshot
          try {
            snapshot = scope.getSnapshot()
          } catch (_error) {
            switchToLocal()
          }
          if (mode === 'config' && scope !== undefined) {
            if (snapshot.status === 'unavailable') {
              switchToLocal()
            } else if (snapshot.status !== 'ready') {
              return { ok: false, code: 'loading' }
            } else if (snapshot.writable !== true) {
              return { ok: false, code: 'readOnly' }
            } else {
              const latest = parseNotes(snapshot.value === undefined ? undefined : snapshot.value.notes)
              const note = { id: createId(), text, createdAt: Date.now() }
              const next = [note, ...latest]
              let accepted = false
              try {
                accepted = await scope.set('notes', JSON.stringify(next))
              } catch (_error) {
                accepted = false
              }
              if (!accepted) return { ok: false, code: 'save' }
              publish({ notes: next, status: 'ready', writable: true, durable: true })
              return { ok: true }
            }
          }
        }

        const note = { id: createId(), text, createdAt: Date.now() }
        const next = [note, ...state.notes]
        if (!writeLocalNotes(next)) return { ok: false, code: 'save' }
        publish({ notes: next, status: 'ready', writable: true, durable: false })
        return { ok: true }
      }

      async function remove(id) {
        if (typeof id !== 'string' || id === '') return false
        if (mode === 'config' && scope !== undefined) {
          let snapshot
          try {
            snapshot = scope.getSnapshot()
          } catch (_error) {
            switchToLocal()
          }
          if (mode === 'config' && scope !== undefined) {
            if (snapshot.status === 'unavailable') {
              switchToLocal()
            } else if (snapshot.status !== 'ready') {
              return false
            } else if (snapshot.writable !== true) {
              return false
            } else {
              const latest = parseNotes(snapshot.value === undefined ? undefined : snapshot.value.notes)
              const next = latest.filter((note) => note.id !== id)
              if (next.length === latest.length) return true
              let accepted = false
              try {
                accepted = await scope.set('notes', JSON.stringify(next))
              } catch (_error) {
                accepted = false
              }
              if (!accepted) return false
              publish({ notes: next, status: 'ready', writable: true, durable: true })
              return true
            }
          }
        }

        const next = state.notes.filter((note) => note.id !== id)
        if (next.length === state.notes.length) return true
        if (!writeLocalNotes(next)) return false
        publish({ notes: next, status: 'ready', writable: true, durable: false })
        return true
      }

      function dispose() {
        if (disposed) return
        disposed = true
        if (typeof unsubscribe === 'function') {
          try {
            unsubscribe()
          } catch (_error) {
            /* the provider owns the scope */
          }
        }
        listeners.clear()
      }

      return {
        getSnapshot: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        add,
        remove,
        dispose,
        mode: () => mode,
      }
    }

    function useNotesStore(store) {
      const [snapshot, setSnapshot] = useState(() => store.getSnapshot())
      useEffect(() => {
        setSnapshot(store.getSnapshot())
        return store.subscribe(() => setSnapshot(store.getSnapshot()))
      }, [store])
      return snapshot
    }

    function NewNoteDialog({ t, titleId, draft, setDraft, saving, error, canSave, readOnly, onCancel, onSave }) {
      const panelRef = useRef(null)
      const textareaRef = useRef(null)

      useEffect(() => {
        const textarea = textareaRef.current
        if (textarea === null) return
        textarea.focus()
        try {
          const end = textarea.value.length
          textarea.setSelectionRange(end, end)
        } catch (_error) {
          /* selection is best-effort */
        }
      }, [])

      function onKeyDown(event) {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onCancel()
          return
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          if (event.nativeEvent !== undefined && event.nativeEvent.isComposing === true) return
          event.preventDefault()
          event.stopPropagation()
          if (canSave) onSave()
          return
        }
        if (event.key === 'Tab') {
          const panel = panelRef.current
          if (panel === null) return
          const focusables = Array.from(
            panel.querySelectorAll('button:not([disabled]), textarea:not([disabled])'),
          )
          if (focusables.length === 0) return
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          const active = document.activeElement
          if (event.shiftKey && active === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && active === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }

      return h(
        'div',
        {
          ref: panelRef,
          className: 'dsh-cn-dialog',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': titleId,
          onKeyDown,
        },
        h('h2', { id: titleId, className: 'dsh-cn-dialogTitle' }, t('dialog.title')),
        h('p', { className: 'dsh-cn-dialogHint' }, t('dialog.hint')),
        h('textarea', {
          ref: textareaRef,
          className: 'dsh-cn-textarea',
          value: draft,
          placeholder: t('dialog.placeholder'),
          spellCheck: false,
          onChange: (event) => setDraft(event.target.value),
        }),
        readOnly ? h('p', { className: 'dsh-cn-dialogError', role: 'alert' }, t('error.readOnly')) : null,
        error !== null ? h('p', { className: 'dsh-cn-dialogError', role: 'alert' }, error) : null,
        h(
          'div',
          { className: 'dsh-cn-footer' },
          h(
            'button',
            {
              type: 'button',
              className: 'dsh-cn-button dsh-cn-secondary',
              onClick: onCancel,
              disabled: saving,
            },
            t('dialog.cancel'),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dsh-cn-button dsh-cn-primary',
              onClick: onSave,
              disabled: !canSave,
            },
            saving ? t('dialog.saving') : t('dialog.save'),
          ),
        ),
      )
    }

    function ComposerNotes({ inputActions, notesStore, t }) {
      const tr = typeof t === 'function' ? t : (key) => key
      const store = useNotesStore(notesStore)
      const [open, setOpen] = useState(false)
      const [menuError, setMenuError] = useState(null)
      const [dialogOpen, setDialogOpen] = useState(false)
      const [draft, setDraft] = useState('')
      const [saving, setSaving] = useState(false)
      const [dialogError, setDialogError] = useState(null)
      const [position, setPosition] = useState(null)
      const triggerRef = useRef(null)
      const menuRef = useRef(null)
      const insertingRef = useRef(false)
      const uid = useLocalId('dsh-cn')
      const menuId = `${uid}-menu`
      const titleId = `${uid}-title`

      const readOnly = store.status === 'ready' && store.writable === false
      const canSave =
        store.status === 'ready' && !readOnly && !saving && typeof draft === 'string' && draft.trim() !== ''

      const updatePosition = useCallback(() => {
        const trigger = triggerRef.current
        if (trigger === null) return
        const rect = trigger.getBoundingClientRect()
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight
        const width = Math.min(300, Math.max(220, viewportWidth - 16))
        const left = Math.max(8, Math.min(rect.left, viewportWidth - width - 8))
        const above = rect.top - 12
        const below = viewportHeight - rect.bottom - 12
        const openUp = above >= Math.min(MENU_MAX_HEIGHT, below) || below < 160
        const maxHeight = Math.max(120, Math.min(MENU_MAX_HEIGHT, openUp ? above : below))
        if (openUp) {
          setPosition({
            position: 'fixed',
            left,
            bottom: Math.max(8, viewportHeight - rect.top + 8),
            width,
            maxHeight,
            zIndex: 1100,
          })
        } else {
          setPosition({
            position: 'fixed',
            left,
            top: Math.min(viewportHeight - 8, rect.bottom + 8),
            width,
            maxHeight,
            zIndex: 1100,
          })
        }
      }, [])

      useLayoutEffect(() => {
        if (!open) {
          setPosition(null)
          return
        }
        updatePosition()
      }, [open, updatePosition])

      useEffect(() => {
        if (!open) return undefined
        function onPointerDown(event) {
          const target = event.target
          if (!(target instanceof Node)) return
          if (menuRef.current !== null && menuRef.current.contains(target)) return
          if (triggerRef.current !== null && triggerRef.current.contains(target)) return
          setOpen(false)
          setMenuError(null)
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        return () => document.removeEventListener('pointerdown', onPointerDown, true)
      }, [open])

      useEffect(() => {
        if (!open) return undefined
        const move = () => updatePosition()
        window.addEventListener('resize', move)
        return () => {
          window.removeEventListener('resize', move)
        }
      }, [open, updatePosition])

      useEffect(() => {
        if (!open || position === null) return
        const menu = menuRef.current
        if (menu === null) return
        if (menu.contains(document.activeElement)) return
        const first = menu.querySelector('[role="menuitem"]')
        if (first instanceof HTMLElement) first.focus()
      }, [open, position])

      function toggleMenu() {
        setMenuError(null)
        setOpen((value) => !value)
      }

      function closeMenu() {
        setOpen(false)
        setMenuError(null)
        if (triggerRef.current !== null) triggerRef.current.focus()
      }

      async function insertNote(note) {
        if (insertingRef.current) return
        if (inputActions === undefined || typeof inputActions.insertText !== 'function') {
          setMenuError(tr('error.insert'))
          return
        }
        insertingRef.current = true
        try {
          let span
          try {
            span = inputActions.captureInsertion()
          } catch (_error) {
            setMenuError(tr('error.insert'))
            return
          }
          let accepted = false
          try {
            accepted = inputActions.insertText(note.text, span)
          } catch (_error) {
            accepted = false
          }
          if (accepted === false) {
            setMenuError(tr('error.insert'))
            return
          }
          let removed = false
          try {
            removed = await notesStore.remove(note.id)
          } catch (_error) {
            removed = false
          }
          if (!removed) {
            setMenuError(tr('error.remove'))
            return
          }
          setOpen(false)
          setMenuError(null)
        } finally {
          insertingRef.current = false
        }
      }

      function openDialog() {
        setOpen(false)
        setMenuError(null)
        setDraft('')
        setDialogError(null)
        setSaving(false)
        setDialogOpen(true)
      }

      function closeDialog() {
        if (saving) return
        setDialogOpen(false)
        setDraft('')
        setDialogError(null)
        if (triggerRef.current !== null) triggerRef.current.focus()
      }

      async function saveNote() {
        if (saving) return
        if (typeof draft !== 'string' || draft.trim() === '') return
        if (store.status !== 'ready' || readOnly) {
          setDialogError(readOnly ? tr('error.readOnly') : tr('error.save'))
          return
        }
        setSaving(true)
        setDialogError(null)
        let result
        try {
          result = await notesStore.add(draft)
        } catch (_error) {
          result = { ok: false, code: 'save' }
        }
        setSaving(false)
        if (result === undefined || result.ok !== true) {
          const code = result === undefined ? 'save' : result.code
          setDialogError(
            code === 'readOnly' ? tr('error.readOnly') : code === 'loading' ? tr('menu.loading') : tr('error.save'),
          )
          return
        }
        setDialogOpen(false)
        setDraft('')
        setDialogError(null)
        setOpen(true)
      }

      function onMenuKeyDown(event) {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          closeMenu()
          return
        }
        if (
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp' ||
          event.key === 'Home' ||
          event.key === 'End'
        ) {
          const menu = menuRef.current
          if (menu === null) return
          const items = Array.from(menu.querySelectorAll('[role="menuitem"]'))
          if (items.length === 0) return
          event.preventDefault()
          const index = items.indexOf(document.activeElement)
          let nextIndex
          if (event.key === 'Home') nextIndex = 0
          else if (event.key === 'End') nextIndex = items.length - 1
          else if (event.key === 'ArrowDown') nextIndex = index < 0 ? 0 : (index + 1) % items.length
          else nextIndex = index <= 0 ? items.length - 1 : index - 1
          items[nextIndex].focus()
        }
      }

      const notes = store.notes

      const menu =
        open && position !== null
          ? createPortal(
              h(
                'div',
                {
                  ref: menuRef,
                  id: menuId,
                  className: 'dsh-cn-menu',
                  role: 'menu',
                  'aria-label': tr('button.label'),
                  style: position,
                  onKeyDown: onMenuKeyDown,
                },
                notes.map((note) =>
                  h(
                    'button',
                    {
                      key: note.id,
                      type: 'button',
                      role: 'menuitem',
                      className: 'dsh-cn-item',
                      title: note.text,
                      onClick: () => insertNote(note),
                    },
                    h('span', { className: 'dsh-cn-itemIcon', 'aria-hidden': true }, noteSvg()),
                    h('span', { className: 'dsh-cn-itemText' }, previewOf(note.text)),
                  ),
                ),
                store.status === 'loading'
                  ? h('div', { key: 'loading', className: 'dsh-cn-note', role: 'status' }, tr('menu.loading'))
                  : null,
                store.status !== 'loading' && notes.length === 0
                  ? h('div', { key: 'empty', className: 'dsh-cn-note' }, tr('menu.empty'))
                  : null,
                menuError !== null
                  ? h('div', { key: 'error', className: 'dsh-cn-error', role: 'alert' }, menuError)
                  : null,
                h('div', { key: 'divider', className: 'dsh-cn-divider', role: 'separator' }),
                h(
                  'button',
                  {
                    key: 'new',
                    type: 'button',
                    role: 'menuitem',
                    className: 'dsh-cn-item dsh-cn-new',
                    onClick: openDialog,
                  },
                  h('span', { className: 'dsh-cn-itemIcon', 'aria-hidden': true }, plusSvg()),
                  h('span', { className: 'dsh-cn-itemText' }, tr('menu.new')),
                ),
              ),
              document.body,
            )
          : null

      const dialog = dialogOpen
        ? createPortal(
            h(
              'div',
              {
                className: 'dsh-cn-overlay',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget) closeDialog()
                },
              },
              h(NewNoteDialog, {
                t: tr,
                titleId,
                draft,
                setDraft,
                saving,
                error: dialogError,
                canSave,
                readOnly,
                onCancel: closeDialog,
                onSave: saveNote,
              }),
            ),
            document.body,
          )
        : null

      return h(
        React.Fragment,
        null,
        h('style', { key: 'styles' }, CSS),
        h(
          'div',
          { className: 'dsh-cn-root' },
          h(
            'button',
            {
              ref: triggerRef,
              type: 'button',
              className: 'dsh-cn-trigger',
              'aria-label': tr('button.label'),
              title: tr('button.label'),
              'aria-haspopup': 'menu',
              'aria-expanded': open,
              'aria-controls': open ? menuId : undefined,
              onClick: toggleMenu,
              disabled: inputActions === undefined,
            },
            h('span', { className: 'dsh-cn-triggerIcon', 'aria-hidden': true }, noteSvg()),
            h('span', { className: 'dsh-cn-triggerLabel' }, tr('button.label')),
            h(
              'span',
              { className: 'dsh-cn-chevron', 'data-open': open ? 'true' : 'false', 'aria-hidden': true },
              chevronSvg(),
            ),
          ),
        ),
        menu,
        dialog,
      )
    }

    function apply(ctx) {
      ctx.effect(
        () => ctx.locale.register(NS, { en, zh }),
        'composer-notes: dictionaries',
      )

      const notesStore = createNotesStore(ctx)
      ctx.effect(() => () => notesStore.dispose(), 'composer-notes: store')

      ctx.slots.inject('conversation.input.left', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.left',
            id: 'composer-notes',
            order: 10,
            locale: NS,
            inject: () => ({ notesStore }),
          },
          ComposerNotes,
        ),
      )
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
