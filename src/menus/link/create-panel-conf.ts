/**
 * @description link 菜单 panel tab 配置
 * @author wangfupeng
 */

import editor from '../../editor/index'
import { PanelConf } from '../menu-constructors/Panel'
import { getRandom } from '../../utils/util'
import $, { DomElement } from '../../utils/dom-core'
import isActive from './is-active'

export default function (editor: editor, text: string, link: string): PanelConf {
    // panel 中需要用到的id
    const inputLinkId = getRandom('input-link')
    const inputTextId = getRandom('input-text')
    const btnOkId = getRandom('btn-ok')
    const btnDelId = getRandom('btn-del')

    // 是否显示“删除链接”
    const delBtnDisplay = isActive(editor) ? 'inline-block' : 'none'

    let $selectedLink: DomElement

    /**
     * 选中整个链接元素
     */
    function selectLinkElem(): void {
        if (!isActive(editor)) return

        const $linkElem = editor.selection.getSelectionContainerElem()
        if (!$linkElem) return
        editor.selection.createRangeByElem($linkElem)
        editor.selection.restoreSelection()

        $selectedLink = $linkElem // 赋值给函数内全局变量
    }

    /**
     * 插入链接
     * @param text 文字
     * @param link 链接
     */
    function insertLink(text: string, link: string): void {
        if (isActive(editor)) {
            // 选区处于链接中，则选中整个菜单，再执行 insertHTML
            selectLinkElem()
            editor.cmd.do('insertHTML', `<a href="${link}" target="_blank">${text}</a>`)
        } else {
            // 选区未处于链接中，直接插入即可
            editor.cmd.do('insertHTML', `<a href="${link}" target="_blank">${text}</a>`)
        }
    }

    /**
     * 删除链接
     */
    function delLink(): void {
        if (!isActive(editor)) {
            return
        }
        // 选中整个链接
        selectLinkElem()
        // 用文本替换链接
        const selectionText = $selectedLink.text()
        editor.cmd.do('insertHTML', '<span>' + selectionText + '</span>')
    }

    /**
     * 校验链接是否合法
     * @param link 链接
     */
    function linkCheck(text: string, link: string): boolean {
        const check = editor.config.linkCheck(text, link)
        if (check == undefined) {
            //用户未能通过开发者的校验，开发者自定义提示方式，编辑器无需重复校验，也不必执行链接插入
        } else if (check == true) {
            //用户通过了开发者的校验，编辑器正常校验，并提示
            const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
            if (urlregex.test(link)) {
                return true
            } else {
                alert('您插入的链接不正确，请重新输入！')
            }
        } else {
            //用户未能通过开发者的校验，开发者希望我们提示这一字符串
            alert(check)
        }
        return false
    }

    const conf = {
        width: 300,
        height: 0,

        // panel 中可包含多个 tab
        tabs: [
            {
                // tab 的标题
                title: editor.i18next.t('menus.panelMenus.link.链接'),
                // 模板
                tpl: `<div>
                        <input 
                            id="${inputTextId}" 
                            type="text" 
                            class="block" 
                            value="${text}" 
                            placeholder="${editor.i18next.t('menus.panelMenus.link.链接文字')}"/>
                        </td>
                        <input 
                            id="${inputLinkId}" 
                            type="text" 
                            class="block" 
                            value="${link}" 
                            placeholder="${editor.i18next.t('如')} https://..."/>
                        </td>
                        <div class="w-e-button-container">
                            <button id="${btnOkId}" class="right">
                                ${editor.i18next.t('插入')}
                            </button>
                            <button id="${btnDelId}" class="gray right" style="display:${delBtnDisplay}">
                                ${editor.i18next.t('menus.panelMenus.link.删除链接')}
                            </button>
                        </div>
                    </div>`,
                // 事件绑定
                events: [
                    // 插入链接
                    {
                        selector: '#' + btnOkId,
                        type: 'click',
                        fn: () => {
                            // 执行插入链接
                            const $link = $('#' + inputLinkId)
                            const $text = $('#' + inputTextId)
                            let link = $link.val().trim()
                            let text = $text.val().trim()

                            // 链接为空，则不插入
                            if (!link) return
                            // 文本为空，则用链接代替
                            if (!text) text = link
                            // 校验链接是否合法，若不合法则不插入
                            if (!linkCheck(text, link)) return

                            insertLink(text, link)

                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        },
                    },
                    // 删除链接
                    {
                        selector: '#' + btnDelId,
                        type: 'click',
                        fn: () => {
                            // 执行删除链接
                            delLink()

                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        },
                    },
                ],
            }, // tab end
        ], // tabs end
    }

    return conf
}
