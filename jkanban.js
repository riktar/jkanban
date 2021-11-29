/**
 * jKanban
 * Vanilla Javascript plugin for manage kanban boards
 *
 * @site: http://www.riccardotartaglia.it/jkanban/
 * @author: Riccardo Tartaglia
 */

//Require dragula
var dragula = require('dragula');

(function () {
  this.jKanban = function () {
    var self = this
    var __DEFAULT_ITEM_HANDLE_OPTIONS = {
      enabled: false
    }
    var __DEFAULT_ITEM_ADD_OPTIONS = {
      enabled: false
    }
    this._disallowedItemProperties = [
      'id',
      'title',
      'click',
      'context',
      'drag',
      'dragend',
      'drop',
      'order'
    ]
    this.element = ''
    this.container = ''
    this.boardContainer = []
    this.handlers = []
    this.dragula = dragula
    this.drake = ''
    this.drakeBoard = ''
    this.itemAddOptions = __DEFAULT_ITEM_ADD_OPTIONS
    this.itemHandleOptions = __DEFAULT_ITEM_HANDLE_OPTIONS
    var defaults = {
      element: '',
      gutter: '15px',
      widthBoard: '250px',
      responsive: '700',
      responsivePercentage: false,
      boards: [],
      dragBoards: true,
      dragItems: true, //whether can drag cards or not, useful when set permissions on it.
      itemAddOptions: __DEFAULT_ITEM_ADD_OPTIONS,
      itemHandleOptions: __DEFAULT_ITEM_HANDLE_OPTIONS,
      dragEl: function (el, source) {},
      dragendEl: function (el) {},
      dropEl: function (el, target, source, sibling) {},
      dragBoard: function (el, source) {},
      dragendBoard: function (el) {},
      dropBoard: function (el, target, source, sibling) {},
      click: function (el) {},
      context: function (el, e) {},
      buttonClick: function (el, boardId) {},
      propagationHandlers: [],
    }

    if (arguments[0] && typeof arguments[0] === 'object') {
      this.options = __extendDefaults(defaults, arguments[0])
    }

    this.__getCanMove = function (handle) {
      if (!self.options.itemHandleOptions.enabled) {
        return !!self.options.dragItems
      }

      if (self.options.itemHandleOptions.handleClass) {
        return handle.classList.contains(self.options.itemHandleOptions.handleClass)
      }

      return handle.classList.contains('item_handle')
    }

    this.init = function () {
      //set initial boards
      __setBoard()
      //set drag with dragula
      if (window.innerWidth > self.options.responsive) {
        //Init Drag Board
        self.drakeBoard = self
          .dragula([self.container], {
            moves: function (el, source, handle, sibling) {
              if (!self.options.dragBoards) return false
              return (
                handle.classList.contains('kanban-board-header') ||
                handle.classList.contains('kanban-title-board')
              )
            },
            accepts: function (el, target, source, sibling) {
              return target.classList.contains('kanban-container')
            },
            revertOnSpill: true,
            direction: 'horizontal'
          })
          .on('drag', function (el, source) {
            el.classList.add('is-moving')
            self.options.dragBoard(el, source)
            if (typeof el.dragfn === 'function') el.dragfn(el, source)
          })
          .on('dragend', function (el) {
            __updateBoardsOrder()
            el.classList.remove('is-moving')
            self.options.dragendBoard(el)
            if (typeof el.dragendfn === 'function') el.dragendfn(el)
          })
          .on('drop', function (el, target, source, sibling) {
            el.classList.remove('is-moving')
            self.options.dropBoard(el, target, source, sibling)
            if (typeof el.dropfn === 'function')
              el.dropfn(el, target, source, sibling)
          })

        //Init Drag Item
        self.drake = self
          .dragula(self.boardContainer, {
            moves: function (el, source, handle, sibling) {
              return self.__getCanMove(handle)
            },
            revertOnSpill: true
          })
          .on('cancel', function (el, container, source) {
            self.enableAllBoards()
          })
          .on('drag', function (el, source) {
            var elClass = el.getAttribute('class')
            if (elClass !== '' && elClass.indexOf('not-draggable') > -1) {
              self.drake.cancel(true)
              return
            }

            el.classList.add('is-moving')

            self.options.dragEl(el, source)

            var boardJSON = __findBoardJSON(source.parentNode.dataset.id)
            if (boardJSON.dragTo !== undefined) {
              self.options.boards.map(function (board) {
                if (
                  boardJSON.dragTo.indexOf(board.id) === -1 &&
                  board.id !== source.parentNode.dataset.id
                ) {
                  self.findBoard(board.id).classList.add('disabled-board')
                }
              })
            }

            if (el !== null && typeof el.dragfn === 'function')
              el.dragfn(el, source)
          })
          .on('dragend', function (el) {
            self.options.dragendEl(el)
            if (el !== null && typeof el.dragendfn === 'function')
              el.dragendfn(el)
          })
          .on('drop', function (el, target, source, sibling) {
            self.enableAllBoards()

            var boardJSON = __findBoardJSON(source.parentNode.dataset.id)
            if (boardJSON.dragTo !== undefined) {
              if (
                boardJSON.dragTo.indexOf(target.parentNode.dataset.id) === -1 &&
                target.parentNode.dataset.id !== source.parentNode.dataset.id
              ) {
                self.drake.cancel(true)
              }
            }
            if (el !== null) {
              var result = self.options.dropEl(el, target, source, sibling)
              if (result === false) {
                self.drake.cancel(true)
              }
              el.classList.remove('is-moving')
              if (typeof el.dropfn === 'function')
                el.dropfn(el, target, source, sibling)
            }
          })
      }
    }

    this.enableAllBoards = function () {
      var allB = document.querySelectorAll('.kanban-board')
      if (allB.length > 0 && allB !== undefined) {
        for (var i = 0; i < allB.length; i++) {
          allB[i].classList.remove('disabled-board')
        }
      }
    }

    this.addElement = function (boardID, element, position) {
      if (typeof position === 'undefined') {
        position = -1
      }
      var board = self.element.querySelector(
        '[data-id="' + boardID + '"] .kanban-drag'
      )
      var refElement = board.childNodes[position]
      var nodeItem = document.createElement('div')
      nodeItem.classList.add('kanban-item')
      if (typeof element.id !== 'undefined' && element.id !== '') {
        nodeItem.setAttribute('data-eid', element.id)
      }
      if (element.class && Array.isArray(element.class)) {
        element.class.forEach(function (cl) {
          nodeItem.classList.add(cl)
        })
      }
      nodeItem.innerHTML = __buildItemCard(element)
      //add function
      nodeItem.clickfn = element.click
      nodeItem.contextfn = element.context;
      nodeItem.dragfn = element.drag
      nodeItem.dragendfn = element.dragend
      nodeItem.dropfn = element.drop
      __appendCustomProperties(nodeItem, element)
      __onclickHandler(nodeItem)
      __onContextHandler(nodeItem)
      if (self.options.itemHandleOptions.enabled) {
        nodeItem.style.cursor = 'default'
      }
      board.insertBefore(nodeItem, refElement)
      return self
    }

    this.addForm = function (boardID, formItem) {
      var board = self.element.querySelector(
        '[data-id="' + boardID + '"] .kanban-drag'
      )
      var _attribute = formItem.getAttribute('class')
      formItem.setAttribute('class', _attribute + ' not-draggable')
      board.appendChild(formItem)
      return self
    }

    this.addBoards = function (boards, isInit) {
      if (self.options.responsivePercentage) {
        self.container.style.width = '100%'
        self.options.gutter = '1%'
        if (window.innerWidth > self.options.responsive) {
          var boardWidth = (100 - boards.length * 2) / boards.length
        } else {
          var boardWidth = 100 - boards.length * 2
        }
      } else {
        var boardWidth = self.options.widthBoard
      }
      var addButton = self.options.itemAddOptions.enabled
      var buttonContent = self.options.itemAddOptions.content
      var buttonClass = self.options.itemAddOptions.class
      var buttonFooter = self.options.itemAddOptions.footer

      //for on all the boards
      for (var boardkey in boards) {
        // single board
        var board = boards[boardkey]
        if (!isInit) {
          self.options.boards.push(board)
        }

        if (!self.options.responsivePercentage) {
          //add width to container
          if (self.container.style.width === '') {
            self.container.style.width =
              parseInt(boardWidth) + parseInt(self.options.gutter) * 2 + 'px'
          } else {
            self.container.style.width =
              parseInt(self.container.style.width) +
              parseInt(boardWidth) +
              parseInt(self.options.gutter) * 2 +
              'px'
          }
        }
        //create node
        var boardNode = document.createElement('div')
        boardNode.dataset.id = board.id
        boardNode.dataset.order = self.container.childNodes.length + 1
        boardNode.classList.add('kanban-board')
        //set style
        if (self.options.responsivePercentage) {
          boardNode.style.width = boardWidth + '%'
        } else {
          boardNode.style.width = boardWidth
        }
        boardNode.style.marginLeft = self.options.gutter
        boardNode.style.marginRight = self.options.gutter
        // header board
        var headerBoard = document.createElement('header')
        if (board.class !== '' && board.class !== undefined)
          var allClasses = board.class.split(',')
        else allClasses = []
        headerBoard.classList.add('kanban-board-header')
        allClasses.map(function (value) {
          // Remove empty spaces
          value = value.replace(/^[ ]+/g, '')
          headerBoard.classList.add(value)
        })
        headerBoard.innerHTML =
          '<div class="kanban-title-board">' + board.title + '</div>'
        //content board
        var contentBoard = document.createElement('main')
        contentBoard.classList.add('kanban-drag')
        if (board.bodyClass !== '' && board.bodyClass !== undefined)
          var bodyClasses = board.bodyClass.split(',')
        else bodyClasses = []
        bodyClasses.map(function (value) {
          contentBoard.classList.add(value)
        })
        //add drag to array for dragula
        self.boardContainer.push(contentBoard)
        for (var itemkey in board.item) {
          //create item
          var itemKanban = board.item[itemkey]
          var nodeItem = document.createElement('div')
          nodeItem.classList.add('kanban-item')
          if (itemKanban.id) {
            nodeItem.dataset.eid = itemKanban.id
          }
          if (itemKanban.class && Array.isArray(itemKanban.class)) {
            itemKanban.class.forEach(function (cl) {
              nodeItem.classList.add(cl)
            })
          }
          nodeItem.innerHTML = __buildItemCard(itemKanban)
          //add function
          nodeItem.clickfn = itemKanban.click
          nodeItem.contextfn = itemKanban.context
          nodeItem.dragfn = itemKanban.drag
          nodeItem.dragendfn = itemKanban.dragend
          nodeItem.dropfn = itemKanban.drop
          __appendCustomProperties(nodeItem, itemKanban)
          //add click handler of item
          __onclickHandler(nodeItem)
          __onContextHandler(nodeItem)
          if (self.options.itemHandleOptions.enabled) {
            nodeItem.style.cursor = 'default'
          }
          contentBoard.appendChild(nodeItem)
        }
        //footer board
        var footerBoard = document.createElement('footer')
        // if add button is true, add button to the board
        if (addButton) {
          var btn = document.createElement('BUTTON')
          var t = document.createTextNode(buttonContent ? buttonContent : '+')
          btn.setAttribute(
            'class',
            buttonClass ? buttonClass : 'kanban-title-button btn btn-default btn-xs'
          )
          btn.appendChild(t)
          //var buttonHtml = '<button class="kanban-title-button btn btn-default btn-xs">'+buttonContent+'</button>'
          if (buttonFooter) {
            footerBoard.appendChild(btn)
          } else {
            headerBoard.appendChild(btn)
          }
          __onButtonClickHandler(btn, board.id)
        }
        //board assembly
        boardNode.appendChild(headerBoard)
        boardNode.appendChild(contentBoard)
        boardNode.appendChild(footerBoard)
        //board add
        self.container.appendChild(boardNode)
      }
      return self
    }

    this.findBoard = function (id) {
      var el = self.element.querySelector('[data-id="' + id + '"]')
      return el
    }

    this.getParentBoardID = function (el) {
      if (typeof el === 'string') {
        el = self.element.querySelector('[data-eid="' + el + '"]')
      }
      if (el === null) {
        return null
      }
      return el.parentNode.parentNode.dataset.id
    }

    this.moveElement = function (targetBoardID, elementID, element) {
      if (targetBoardID === this.getParentBoardID(elementID)) {
        return
      }

      this.removeElement(elementID)
      return this.addElement(targetBoardID, element)
    }

    this.replaceElement = function (el, element) {
      var nodeItem = el
      if (typeof nodeItem === 'string') {
        nodeItem = self.element.querySelector('[data-eid="' + el + '"]')
      }
      nodeItem.innerHTML = __buildItemCard(element)
      // add function
      nodeItem.clickfn = element.click
      nodeItem.contextfn = element.context
      nodeItem.dragfn = element.drag
      nodeItem.dragendfn = element.dragend
      nodeItem.dropfn = element.drop
      __appendCustomProperties(nodeItem, element)
      __onclickHandler(nodeItem)
      __onContextHandler(nodeItem)
      return self
    }

    this.findElement = function (id) {
      var el = self.element.querySelector('[data-eid="' + id + '"]')
      return el
    }

    this.getBoardElements = function (id) {
      var board = self.element.querySelector(
        '[data-id="' + id + '"] .kanban-drag'
      )
      return board.childNodes
    }

    this.removeElement = function (el) {
      if (typeof el === 'string')
        el = self.element.querySelector('[data-eid="' + el + '"]')
      if (el !== null) {
        //fallback for IE
        if (typeof el.remove == 'function') {
          el.remove()
        } else {
          el.parentNode.removeChild(el)
        }
      }
      return self
    }

    this.removeBoard = function (board) {
      var boardElement = null
      if (typeof board === 'string')
        boardElement = self.element.querySelector('[data-id="' + board + '"]')
      if (boardElement !== null) {
        //fallback for IE
        if (typeof boardElement.remove == 'function') {
          boardElement.remove()
        } else {
          boardElement.parentNode.removeChild(boardElement)
        }
      }

      // remove thboard in options.boards
      for (var i = 0; i < self.options.boards.length; i++) {
        if (self.options.boards[i].id === board) {
          self.options.boards.splice(i, 1)
          break
        }
      }

      return self
    }

    // board button on click function
    this.onButtonClick = function (el) {}

    //PRIVATE FUNCTION
    function __extendDefaults (source, properties) {
      var property
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property]
        }
      }
      return source
    }

    function __setBoard () {
      self.element = document.querySelector(self.options.element)
      //create container
      var boardContainer = document.createElement('div')
      boardContainer.classList.add('kanban-container')
      self.container = boardContainer
      //add boards

      if (document.querySelector(self.options.element).dataset.hasOwnProperty('board')) {
        url = document.querySelector(self.options.element).dataset.board
        window.fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
          .then(function (response) {
            // log response text
            response.json().then(function (data) {
              self.options.boards = data
              self.addBoards(self.options.boards, true)
            })

          })
          .catch(function (error) {
            console.log('Error: ', error)
          })
      } else {
        self.addBoards(self.options.boards, true)
      }

      //appends to container
      self.element.appendChild(self.container)
    }

    function __onclickHandler (nodeItem, clickfn) {
      nodeItem.addEventListener('click', function (e) {
        if (!self.options.propagationHandlers.includes('click')) e.preventDefault()
        self.options.click(this)
        if (typeof this.clickfn === 'function') this.clickfn(this)
      })
    }

    function __onContextHandler(nodeItem, contextfn) {
      if (nodeItem.addEventListener) {
          nodeItem.addEventListener('contextmenu', function (e) {
            if (!self.options.propagationHandlers.includes('context')) e.preventDefault()
            self.options.context(this, e)
            if (typeof this.contextfn === 'function') this.contextfn(this, e)
          }, false)
      } else {
        nodeItem.attachEvent('oncontextmenu', function () {
          self.options.context(this)
          if (typeof this.contextfn === 'function') this.contextfn(this)
          if (!self.options.propagationHandlers.includes('context')) window.event.returnValue = false
        })
      }
  }

    function __onButtonClickHandler (nodeItem, boardId) {
      nodeItem.addEventListener('click', function (e) {
        e.preventDefault()
        self.options.buttonClick(this, boardId)
        // if(typeof(this.clickfn) === 'function')
        //     this.clickfn(this);
      })
    }

    function __findBoardJSON (id) {
      var el = []
      self.options.boards.map(function (board) {
        if (board.id === id) {
          return el.push(board)
        }
      })
      return el[0]
    }

    function __appendCustomProperties (element, parentObject) {
      for (var propertyName in parentObject) {
        if (self._disallowedItemProperties.indexOf(propertyName) > -1) {
          continue
        }

        element.setAttribute(
          'data-' + propertyName,
          parentObject[propertyName]
        )
      }
    }

    function __updateBoardsOrder () {
      var index = 1
      for (var i = 0; i < self.container.childNodes.length; i++) {
        self.container.childNodes[i].dataset.order = index++
      }
    }

    function __buildItemCard(item) {
      var result = 'title' in item ? item.title : '';

      if (self.options.itemHandleOptions.enabled) {
          if ((self.options.itemHandleOptions.customHandler || undefined) === undefined) {
              var customCssHandler = self.options.itemHandleOptions.customCssHandler
              var customCssIconHandler = self.options.itemHandleOptions.customCssIconHandler
              var customItemLayout = self.options.itemHandleOptions.customItemLayout
              if ((customCssHandler || undefined) === undefined) {
                  customCssHandler = 'drag_handler';
              }

              if ((customCssIconHandler || undefined) === undefined) {
                  customCssIconHandler = customCssHandler + '_icon';
              }

              if ((customItemLayout || undefined) === undefined) {
                  customItemLayout = '';
              }

              result = '<div class=\'item_handle ' + customCssHandler + '\'><i class=\'item_handle ' + customCssIconHandler + '\'></i></div><div>' + result + '</div>'
          } else {
              result = '<div> ' + self.options.itemHandleOptions.customHandler.replace(/%([^%]+)%/g, function (match, key) 
                      { return item[key] !== undefined ? item[key] : '' }) + ' </div>'
              return result
          }
      }

      return result
  }

    //init plugin
    this.init()
  }
})()
