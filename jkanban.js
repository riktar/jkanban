var dragula = require('dragula');

(function(){

    this.jKanban = function () {
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
            boards : [],
            dragEl : function (el, source) {},
            dragendEl : function (el) {},
            dragBoard : function (el, source) {},
            dragendBoard : function (el) {},
            click: function(el) {}
        };

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
                        self.options.dragBoard(el, source);
                        if(typeof(el.dragfn) === 'function')
                            el.dragfn(el, source);
                    })
                    //Drag End
                    .on('dragend', function (el) {
                        el.classList.remove('is-moving');
                        self.options.dragendBoard(el);
                        if(typeof(el.dragendfn) === 'function')
                            el.dragendfn(el);
                    });

                self.drake = self.dragula(self.boardContainer, function () {
                    revertOnSpill: true
                })
                //Drag
                    .on('drag', function (el, source) {
                        el.classList.add('is-moving');
                        self.options.dragEl(el, source);
                        if(typeof(el.dragfn) === 'function')
                            el.dragfn(el, source);
                    })
                    //Drag End
                    .on('dragend', function (el) {
                        el.classList.remove('is-moving');
                        self.options.dragendEl(el);
                        if(typeof(el.dragendfn) === 'function')
                            el.dragendfn(el);
                    })
            }
        };

        this.addElement = function(boardID, element){
            var board = self.element.querySelector('[data-id="'+boardID+'"] .kanban-drag');
            var nodeItem = document.createElement('div');
            nodeItem.classList.add('kanban-item');
            nodeItem.innerHTML = element.title;
            //add function
            nodeItem.clickfn = element.click;
            nodeItem.dragfn = element.drag;
            nodeItem.dragendfn = element.dragend;
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
                    nodeItem.dataset.eid = itemKanban.id;
                    nodeItem.innerHTML = itemKanban.title;
                    //add function
                    nodeItem.clickfn = itemKanban.click;
                    nodeItem.dragfn = itemKanban.drag;
                    nodeItem.dragendfn = itemKanban.dragend;
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
            return self;
        }

        this.findElement = function(id){
            var el = self.element.querySelector('[data-eid="'+id+'"]');
            return el;
        }

        this.getBoardElements = function(id){
            var board = self.element.querySelector('[data-id="'+id+'"] .kanban-drag');
            return(board.childNodes);
        }

        this.removeElement = function(el){
            if(typeof(el) === 'string' )
                el = self.element.querySelector('[data-eid="'+el+'"]');
            el.remove();
            return self;
        };

        this.removeBoard = function (board){
            if(typeof(board) === 'string' )
                board = self.element.querySelector('[data-id="'+board+'"]');
            board.remove();
            return self;
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

        function __onclickHandler(nodeItem, clickfn){
            nodeItem.addEventListener('click', function(e){
                e.preventDefault;
                self.options.click(this);
                if(typeof(this.clickfn) === 'function')
                    this.clickfn(this);
            });
        }

        //init plugin
        this.init();
    };
}());

