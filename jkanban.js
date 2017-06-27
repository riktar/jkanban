var dragula = require('dragula');

(function(){
    this.Kanban = function () {

        var self = this;
        this.element = '';
        this.container = '';
        this.boardContainer = [];
        this.dragula = dragula;
        this.drake = '';
        this.drakeBoard = '';

        defaults = {
            element : '',
            gutter : '15px',
            widthBoard : '250px',
            responsive : '700',
            drag : function (el, source) {},
            dragend : function (el) {},
            click: function(el) {}
        }

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = __extendDefaults(defaults, arguments[0]);
        }

        this.init = function () {
            //set initial boards
            __setBoard();
            //set drag with dragula
            if(window.innerWidth > self.options.responsive) {
                self.drakeBoard = self.dragula([self.container], {
                    moves: function (el, source, handle, sibling) {
                        return (handle.classList.contains('kanban-board-header') || handle.classList.contains('kanban-title-board'));
                    },
                    accepts: function (el, target, source, sibling) {
                        return target.classList.contains('kanban-container');
                    },
                    revertOnSpill: true,
                    direction: 'horizontal',
                })
                    .on('drag', function (el, source) {
                        el.classList.add('is-moving');
                    })
                    //Drag End
                    .on('dragend', function (el) {
                        el.classList.remove('is-moving');
                    });

                self.drake = self.dragula(self.boardContainer, function () {
                    revertOnSpill: true
                })
                //Drag
                    .on('drag', function (el, source) {
                        el.classList.add('is-moving');
                        self.options.drag(el, source);
                    })
                    //Drag End
                    .on('dragend', function (el) {
                        el.classList.remove('is-moving');
                        self.options.dragend(el);
                    })
            }
            return self;
        };

        this.addElement = function(boardID, element){
            var board = self.element.querySelector('[data-id="'+boardID+'"] .kanban-drag');
            var nodeItem = document.createElement('div');
            nodeItem.classList.add('kanban-item');
            nodeItem.innerHTML = element.title;
            __onclickHandler(nodeItem);
            board.appendChild(nodeItem);
            return self;
        };

        this.addBoards = function(boards){
            var boardWidth = self.options.widthBoard;
            //for on all the boards
            for (var boardkey in boards) {
                // single board
                var board =  boards[boardkey];
                //add width to container
                if (self.container.style.width === '') {
                    self.container.style.width = parseInt(boardWidth) + (parseInt(self.options.gutter) * 2) + 'px';
                } else {
                    self.container.style.width = parseInt(self.container.style.width) + parseInt(boardWidth) + (parseInt(self.options.gutter) * 2) + 'px';
                }
                //create node
                var boardNode = document.createElement('div');
                boardNode.dataset.id = board.id;
                boardNode.classList.add('kanban-board');
                //set style
                boardNode.style.width = boardWidth;
                boardNode.style.marginLeft = self.options.gutter;
                boardNode.style.marginRight = self.options.gutter;
                // header board
                var headerBoard = document.createElement('header');
                headerBoard.classList.add('kanban-board-header', board.class);
                headerBoard.innerHTML = '<div class="kanban-title-board">'+board.title+'</div>';
                //content board
                var contentBoard = document.createElement('main');
                contentBoard.classList.add('kanban-drag');
                //add drag to array for dragula
                self.boardContainer.push(contentBoard);
                for(var itemkey in board.item){
                    //create item
                    var itemKanban = board.item[itemkey];
                    var nodeItem = document.createElement('div');
                    nodeItem.classList.add('kanban-item');
                    nodeItem.innerHTML = itemKanban.title;
                    //add click handler of item
                    __onclickHandler(nodeItem);
                    contentBoard.appendChild(nodeItem);
                }
                //footer board
                var footerBoard = document.createElement('footer');
                //board assembly
                boardNode.appendChild(headerBoard);
                boardNode.appendChild(contentBoard);
                boardNode.appendChild(footerBoard);
                //board add
                self.container.appendChild(boardNode);
            }
        }

        this.removeBoard = function (boardID){
            var board = self.element.querySelector('[data-id="'+boardID+'"]');
            self.container.removeChild(board);
        }

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

        function __setBoard(){
            self.element = document.querySelector(self.options.element);
            //create container
            var boardContainer =  document.createElement('div');
            boardContainer.classList.add('kanban-container');
            self.container = boardContainer;
            //add boards
            self.addBoards(self.options.boards);
            //appends to container
            self.element.appendChild(self.container);
        };

        function __onclickHandler(nodeItem){
            nodeItem.addEventListener('click', function(e){
                e.preventDefault;
                self.options.click(this);
            });
        }

        //init plugin
        this.init();
    };
}());

