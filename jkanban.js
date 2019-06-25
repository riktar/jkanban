/**
 * jKanban
 * Vanilla Javascript plugin for manage kanban boards
 *
 * @site: http://www.riccardotartaglia.it/jkanban/
 * @author: Riccardo Tartaglia
 */

//Require dragula
var dragula = require("dragula");

(function() {
  this.jKanban = function() {
    var self = this;
    this._disallowedItemProperties = [
      "id",
      "title",
      "click",
      "drag",
      "dragend",
      "drop",
      "order"
    ];
    this.element = "";
    this.container = "";
    this.boardContainer = [];
    this.dragula = dragula;
    this.drake = "";
    this.drakeBoard = "";
    this.addItemButton = false;
    this.buttonContent = "+";
    var defaults = {
      element: "",
      gutter: "15px",
      widthBoard: "250px",
      responsive: "700",
      responsivePercentage: false,
      boards: [],
      dragBoards: true,
      dragItems: true, //whether can drag cards or not, useful when set permissions on it.
      addItemButton: false,
      buttonContent: "+",
      dragEl: function(el, source) {},
      dragendEl: function(el) {},
      dropEl: function(el, target, source, sibling) {},
      dragBoard: function(el, source) {},
      dragendBoard: function(el) {},
      dropBoard: function(el, target, source, sibling) {},
      click: function(el) {},
      buttonClick: function(el, boardId) {}
    };

    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = __extendDefaults(defaults, arguments[0]);
    }

    this.init = function() {
      //set initial boards
      __setBoard();
      //set drag with dragula
      if (window.innerWidth > self.options.responsive) {
        //Init Drag Board
        self.drakeBoard = self
          .dragula([self.container], {
            moves: function(el, source, handle, sibling) {
              if (!self.options.dragBoards) return false;
              return (
                handle.classList.contains("kanban-board-header") ||
                handle.classList.contains("kanban-title-board")
              );
            },
            accepts: function(el, target, source, sibling) {
              return target.classList.contains("kanban-container");
            },
            revertOnSpill: true,
            direction: "horizontal"
          })
          .on("drag", function(el, source) {
            el.classList.add("is-moving");
            self.options.dragBoard(el, source);
            if (typeof el.dragfn === "function") el.dragfn(el, source);
          })
          .on("dragend", function(el) {
            __updateBoardsOrder();
            el.classList.remove("is-moving");
            self.options.dragendBoard(el);
            if (typeof el.dragendfn === "function") el.dragendfn(el);
          })
          .on("drop", function(el, target, source, sibling) {
            el.classList.remove("is-moving");
            self.options.dropBoard(el, target, source, sibling);
            if (typeof el.dropfn === "function")
              el.dropfn(el, target, source, sibling);
          });

        //Init Drag Item
        self.drake = self
          .dragula(self.boardContainer, {
            moves: function(el, source, handle, sibling) {
              return !!self.options.dragItems;
            },
            revertOnSpill: true
          })
          .on("cancel", function(el, container, source) {
            self.enableAllBoards();
          })
          .on("drag", function(el, source) {
            var elClass = el.getAttribute("class");
            if (elClass !== "" && elClass.indexOf("not-draggable") > -1) {
              self.drake.cancel(true);
              return;
            }

            el.classList.add("is-moving");
            var boardJSON = __findBoardJSON(source.parentNode.dataset.id);
            if (boardJSON.dragTo !== undefined) {
              self.options.boards.map(function(board) {
                if (
                  boardJSON.dragTo.indexOf(board.id) === -1 &&
                  board.id !== source.parentNode.dataset.id
                ) {
                  self.findBoard(board.id).classList.add("disabled-board");
                }
              });
            }

            self.options.dragEl(el, source);
            if (el !== null && typeof el.dragfn === "function")
              el.dragfn(el, source);
          })
          .on("dragend", function(el) {
            self.options.dragendEl(el);
            if (el !== null && typeof el.dragendfn === "function")
              el.dragendfn(el);
          })
          .on("drop", function(el, target, source, sibling) {
            self.enableAllBoards();

            var boardJSON = __findBoardJSON(source.parentNode.dataset.id);
            if (boardJSON.dragTo !== undefined) {
              if (
                boardJSON.dragTo.indexOf(target.parentNode.dataset.id) === -1 &&
                target.parentNode.dataset.id !== source.parentNode.dataset.id
              ) {
                self.drake.cancel(true);
              }
            }
            if (el !== null) {
              var result = self.options.dropEl(el, target, source, sibling);
              if (result === false) {
                self.drake.cancel(true);
              }
              el.classList.remove("is-moving");
              if (typeof el.dropfn === "function")
                el.dropfn(el, target, source, sibling);
            }
          });
      }
    };

    this.enableAllBoards = function() {
      var allB = document.querySelectorAll(".kanban-board");
      if (allB.length > 0 && allB !== undefined) {
        for (var i = 0; i < allB.length; i++) {
          allB[i].classList.remove("disabled-board");
        }
      }
    };

    this.addElement = function(boardID, element) {
      var board = self.element.querySelector(
        '[data-id="' + boardID + '"] .kanban-drag'
      );
      var nodeItem = document.createElement("div");
      nodeItem.classList.add("kanban-item");
      console.log(element);
      if (typeof element.id !== "undefined" && element.id !== "") {
        nodeItem.setAttribute("data-eid", element.id);
      }
      nodeItem.innerHTML = element.title;
      //add function
      nodeItem.clickfn = element.click;
      nodeItem.dragfn = element.drag;
      nodeItem.dragendfn = element.dragend;
      nodeItem.dropfn = element.drop;
      __appendCustomProperties(nodeItem, element);
      __onclickHandler(nodeItem);
      board.appendChild(nodeItem);
      return self;
    };

    this.addForm = function(boardID, formItem) {
      var board = self.element.querySelector(
        '[data-id="' + boardID + '"] .kanban-drag'
      );
      var _attribute = formItem.getAttribute("class");
      formItem.setAttribute("class", _attribute + " not-draggable");
      board.appendChild(formItem);
      return self;
    };

    this.addBoards = function(boards, isInit) {
      if (self.options.responsivePercentage) {
        self.container.style.width = "100%";
        self.options.gutter = "1%";
        if (window.innerWidth > self.options.responsive) {
          var boardWidth = (100 - boards.length * 2) / boards.length;
        } else {
          var boardWidth = 100 - boards.length * 2;
        }
      } else {
        var boardWidth = self.options.widthBoard;
      }
      var addButton = self.options.addItemButton;
      var buttonContent = self.options.buttonContent;

      //for on all the boards
      for (var boardkey in boards) {
        // single board
        var board = boards[boardkey];
        if (!isInit) {
          self.options.boards.push(board);
        }

        if (!self.options.responsivePercentage) {
          //add width to container
          if (self.container.style.width === "") {
            self.container.style.width =
              parseInt(boardWidth) + parseInt(self.options.gutter) * 2 + "px";
          } else {
            self.container.style.width =
              parseInt(self.container.style.width) +
              parseInt(boardWidth) +
              parseInt(self.options.gutter) * 2 +
              "px";
          }
        }
        //create node
        var boardNode = document.createElement("div");
        boardNode.dataset.id = board.id;
        boardNode.dataset.order = self.container.childNodes.length + 1;
        boardNode.classList.add("kanban-board");
        //set style
        if (self.options.responsivePercentage) {
          boardNode.style.width = boardWidth + "%";
        } else {
          boardNode.style.width = boardWidth;
        }
        boardNode.style.marginLeft = self.options.gutter;
        boardNode.style.marginRight = self.options.gutter;
        // header board
        var headerBoard = document.createElement("header");
        if (board.class !== "" && board.class !== undefined)
          var allClasses = board.class.split(",");
        else allClasses = [];
        headerBoard.classList.add("kanban-board-header");
        allClasses.map(function(value) {
          headerBoard.classList.add(value);
        });
        headerBoard.innerHTML =
          '<div class="kanban-title-board">' + board.title + "</div>";
        // if add button is true, add button to the board
        if (addButton) {
          var btn = document.createElement("BUTTON");
          var t = document.createTextNode(buttonContent);
          btn.setAttribute(
            "class",
            "kanban-title-button btn btn-default btn-xs"
          );
          btn.appendChild(t);
          //var buttonHtml = '<button class="kanban-title-button btn btn-default btn-xs">'+buttonContent+'</button>'
          headerBoard.appendChild(btn);
          __onButtonClickHandler(btn, board.id);
        }
        //content board
        var contentBoard = document.createElement("main");
        contentBoard.classList.add("kanban-drag");
        if (board.bodyClass !== "" && board.bodyClass !== undefined)
          var bodyClasses = board.bodyClass.split(",");
        else bodyClasses = [];
        bodyClasses.map(function(value) {
          contentBoard.classList.add(value);
        });
        //add drag to array for dragula
        self.boardContainer.push(contentBoard);
        for (var itemkey in board.item) {
          //create item
          var itemKanban = board.item[itemkey];
          var nodeItem = document.createElement("div");
          nodeItem.classList.add("kanban-item");
          if (itemKanban.id) {
            nodeItem.dataset.eid = itemKanban.id;
          }
          nodeItem.innerHTML = itemKanban.title;
          //add function
          nodeItem.clickfn = itemKanban.click;
          nodeItem.dragfn = itemKanban.drag;
          nodeItem.dragendfn = itemKanban.dragend;
          nodeItem.dropfn = itemKanban.drop;
          __appendCustomProperties(nodeItem, itemKanban);
          //add click handler of item
          __onclickHandler(nodeItem);
          contentBoard.appendChild(nodeItem);
        }
        //footer board
        var footerBoard = document.createElement("footer");
        //board assembly
        boardNode.appendChild(headerBoard);
        boardNode.appendChild(contentBoard);
        boardNode.appendChild(footerBoard);
        //board add
        self.container.appendChild(boardNode);
      }
      return self;
    };

    this.findBoard = function(id) {
      var el = self.element.querySelector('[data-id="' + id + '"]');
      return el;
    };

    this.getParentBoardID = function(el) {
      if (typeof el === "string") {
        el = self.element.querySelector('[data-eid="' + el + '"]');
      }
      if (el === null) {
        return null;
      }
      return el.parentNode.parentNode.dataset.id;
    };

    this.moveElement = function(targetBoardID, elementID, element) {
      if (targetBoardID === this.getParentBoardID(elementID)) {
        return;
      }

      this.removeElement(elementID);
      return this.addElement(targetBoardID, element);
    };

    this.replaceElement = function(el, element) {
      var nodeItem = el;
      if (typeof nodeItem === "string") {
        nodeItem = self.element.querySelector('[data-eid="' + el + '"]');
      }
      nodeItem.innerHTML = element.title;
      // add function
      nodeItem.clickfn = element.click;
      nodeItem.dragfn = element.drag;
      nodeItem.dragendfn = element.dragend;
      nodeItem.dropfn = element.drop;
      __appendCustomProperties(nodeItem, element);
      return self;
    };

    this.findElement = function(id) {
      var el = self.element.querySelector('[data-eid="' + id + '"]');
      return el;
    };

    this.getBoardElements = function(id) {
      var board = self.element.querySelector(
        '[data-id="' + id + '"] .kanban-drag'
      );
      return board.childNodes;
    };

    this.removeElement = function(el) {
      if (typeof el === "string")
        el = self.element.querySelector('[data-eid="' + el + '"]');
      if (el !== null) {
        el.remove();
      }
      return self;
    };

    this.removeBoard = function(board) {
      var boardElement = null;
      if (typeof board === "string")
        boardElement = self.element.querySelector('[data-id="' + board + '"]');
      if (boardElement !== null) {
        boardElement.remove();
      }
      
      // remove thboard in options.boards
	    for(var i = 0; i < self.options.boards.length; i++) {
		    if(self.options.boards[i].id === board) {
			    self.options.boards.splice(i, 1);
			    break;
		    }
	    }
      
      return self;
    };

    // board button on click function
    this.onButtonClick = function(el) {};

    //PRIVATE FUNCTION
    function __extendDefaults(source, properties) {
      var property;
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    }

    function __setBoard() {
      self.element = document.querySelector(self.options.element);
      //create container
      var boardContainer = document.createElement("div");
      boardContainer.classList.add("kanban-container");
      self.container = boardContainer;
      //add boards
      self.addBoards(self.options.boards, true);
      //appends to container
      self.element.appendChild(self.container);
    }

    function __onclickHandler(nodeItem, clickfn) {
      nodeItem.addEventListener("click", function(e) {
        e.preventDefault();
        self.options.click(this);
        if (typeof this.clickfn === "function") this.clickfn(this);
      });
    }

    function __onButtonClickHandler(nodeItem, boardId) {
      nodeItem.addEventListener("click", function(e) {
        e.preventDefault();
        self.options.buttonClick(this, boardId);
        // if(typeof(this.clickfn) === 'function')
        //     this.clickfn(this);
      });
    }

    function __findBoardJSON(id) {
      var el = [];
      self.options.boards.map(function(board) {
        if (board.id === id) {
          return el.push(board);
        }
      });
      return el[0];
    }

    function __appendCustomProperties(element, parentObject) {
      for (var propertyName in parentObject) {
        if (self._disallowedItemProperties.indexOf(propertyName) > -1) {
          continue;
        }

        element.setAttribute(
          "data-" + propertyName,
          parentObject[propertyName]
        );
      }
    }

    function __updateBoardsOrder() {
      var index = 1;
      for (var i = 0; i < self.container.childNodes.length; i++) {
        self.container.childNodes[i].dataset.order = index++;
      }
    }

    //init plugin
    this.init();
  };
})();
