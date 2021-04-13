        function drag_auto_scroll(el_drg) {
        //Thanks to StackOverFlow
        //Thanks to Peter-Paul Koch for Some of his concepts borrowed from http://www.quirksmode.org/js/dragdrop.html
            this.addEventSimple = function (obj, evt, fn) {
                if (obj.addEventListener)
                    obj.addEventListener(evt, fn, false);
                else if (obj.attachEvent)
                    obj.attachEvent('on' + evt, fn);
            };
            this.removeEventSimple = function (obj, evt, fn) {
                if (obj.removeEventListener)
                    obj.removeEventListener(evt, fn, false);
                else if (obj.detachEvent)
                    obj.detachEvent('on' + evt, fn);
            };
            this.fade = function (el_f, o) {
                var oo = o / 100;
                el_f.style.opacity = oo;
                el_f.style['-ms-filter'] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + o + ")";
                el_f.style['-khtml-opacity'] = oo;
                el_f.style['-moz-opacity'] = oo;
                el_f.style.filter = "Alpha(Opacity=" + o + "); -moz-opacity:" + oo + "; opacity:" + oo + ";-khtml-opacity:" + oo + ";";
                if (o >= 100) {
                    el_f.style.filter = '';
                }
            };
            this.intersectRect = function (r1, r2) {
                return !(r2.left > r1.right ||
               r2.right < r1.left ||
               r2.top > r1.bottom ||
               r2.bottom < r1.top);
            };
            this.getposition=function(el){
                var rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                var l, t, w, h, sw, sh, sbw, sbh;
                if (el == document.body) {
                    l = 0;
                    t = 0;
                    w = document.body.clientWidth || document.documentElement.clientWidth || window.innerWidth ;//don't change this order
                    h = document.body.clientHeight || document.documentElement.clientHeight || window.innerHeight; //don't change this order
                    sw = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
                    sh = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                    sbw = (document.documentElement.clientWidth - document.body.offsetWidth); //16
                    sbh = (document.documentElement.clientHeight - document.body.offsetHeight); //16
                } else {
                    l=rect.left + scrollLeft;
                    t=rect.top + scrollTop ;
                    w=rect.right - rect.left;
                    h = rect.bottom - rect.top;
                    sw = el.scrollWidth;
                    sh = el.scrollHeight;
                    sbw = el.offsetWidth - el.clientWidth; //17
                    sbh = el.offsetHeight - el.clientHeight; //17
                }
                return { left: l, top: t
                    , width: w, height: h
                    , right: l + w
                    , bottom: t + h
                    , scrollLeft: scrollLeft
                    , scrollTop: scrollTop
                    , scrollWidth: sw
                    , scrollHeight: sh
                };
            };
            this.getoffset=function(){
                var el=arguments[0];
                var rect = el.getBoundingClientRect();
                var includescroll=(arguments.length==1 || arguments[1]!==false);
                var l,t,w, h,scrollLeft=0,scrollTop=0,isbody=false,sw,sh,sbw,sbh;
                if (el == document.body) {
                    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
                    scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                    isbody = true;
                    l = (includescroll==true?scrollLeft:0);//scrollLeft//
                    t=  (includescroll==true?scrollTop:0) ;//scrollTop//
                    w = document.body.clientWidth || document.documentElement.clientWidth || window.innerWidth ;//don't change this order
                    h = document.body.clientHeight || document.documentElement.clientHeight || window.innerHeight; //don't change this order
                    sw = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
                    sh = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                    sbw = (document.documentElement.clientWidth - document.body.offsetWidth); //16
                    sbh = (document.documentElement.clientHeight - document.body.offsetHeight); //16
                } else {
                    scrollLeft = el.parentNode.scrollLeft;
                    scrollTop = el.parentNode.scrollTop;
                    l=rect.left + (includescroll==true?scrollLeft:0);
                    t=rect.top + (includescroll==true?scrollTop:0) ;
                    w=rect.right - rect.left;
                    h = rect.bottom - rect.top;
                    sw = el.parentNode.scrollWidth;
                    sh = el.parentNode.scrollHeight;
                    sbw =  el.parentNode.offsetWidth - el.parentNode.clientWidth; //17
                    sbh = el.parentNode.offsetHeight - el.parentNode.clientHeight; //17
                }
                return { left: l, top: t
                    , width: w, height: h
                    , offsetLeft: (isbody == true ?0:rect.left), offsetTop:(isbody == true ?0: rect.top)
                    , right: l + w
                    , bottom: t + h
                    , scrollLeft: scrollLeft
                    , scrollTop: scrollTop
                    , isBody: isbody
                    , scrollWidth: sw
                    , scrollHeight: sh
                    , scrollBarWidth: sbw
                    , scrollBarHeight: sbh
                };
            };
            this.rectoverlap = function (target, drgpos, xpos, ypos) {
                var targetpos = {};
                if (target.getBoundingClientRect) {
                    targetpos = target.getBoundingClientRect();
                }
                var x_overlap = Math.max(0, Math.min(drgpos.right, targetpos.right) - Math.max(drgpos.left, targetpos.left))
                var y_overlap = Math.max(0, Math.min(drgpos.bottom, targetpos.bottom) - Math.max(drgpos.top, targetpos.top));
                var lp = Math.floor(x_overlap / Math.min((drgpos.right - drgpos.left), (targetpos.right - targetpos.left)) * 100);
                var tp = Math.floor(y_overlap / Math.min((drgpos.bottom - drgpos.top), (targetpos.bottom - targetpos.top)) * 100);
                if (lp > 0 && tp > 0) {
                    //                if (this.intersectRect(drgpos, targetpos) == true) {
                    return { target: target, lp: lp, tp: tp };
                }
                return null;
            }; /*rectoverlap*/
            this.hittest = function (target, x, y ) {
                var offset=this.getposition(target);
                x+=offset.scrollLeft;
                y+=offset.scrollTop;
                //info.innerHTML=scrollLeft+'x'+scrollTop;
                //info.innerHTML+='<br>'+JSON.stringify(offset);
                //info.innerHTML+='<br>'+x+'x'+y;
                if ((x > offset.left && y > offset.top) && (x < offset.right && y < offset.bottom)) {
                    var lp = Math.floor(Math.min(x-offset.left,offset.right-x )*2/ offset.width  * 100);
                    var tp = Math.floor(Math.min(y-offset.top,offset.bottom-y )*2 / offset.height  * 100);
                    //info.innerHTML+='<br>'+lp+'x'+tp;
                    return { target: target, lp: lp, tp: tp };
                }
                return null;
            };           /*hittest*/
            this.getevent = function (e) {
                e = e || window.event;
                //                if (e.originalEvent && e.originalEvent.touches) {
                //                    var oe = e.originalEvent;
                //                    e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0];
                //                }
                if (e.touches) {
                    e = e.touches[0];
                }
            };
            this.scrollLeft = function (el_s, left, top) {
                if (el_s == document.body || el_s == null) {
                    if (left == undefined) {
                        //return (window.pageXOffset !== undefined) ? window.pageXOffset : (document.body  || document.documentElement || document.body.parentNode).scrollLeft;
                        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
                    } else {
                        document.body.scrollLeft = left; //Chrome
                        document.documentElement.scrollLeft = left; //IE8
                        //                    window.scrollTo(left, top); //All
                    }
                } else {
                    if (left == undefined) {
                        return el_s.scrollLeft;
                    } else {
                        el_s.scrollLeft = left;
                    }
                }
            };
            this.scrollTop = function (el_s, top, left) {
                if (el_s == document.body || el_s == null) {
                    if (top == undefined) {
                        //return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.body  || document.documentElement || document.body.parentNode).scrollTop;
                        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                    } else {
                        document.body.scrollTop = top; //Chrome
                        document.documentElement.scrollTop = top; //IE8
                        //                    window.scrollTo(left, top); //All
                    }
                } else {
                    if (top == undefined) {
                        return el_s.scrollTop;
                    } else {
                        el_s.scrollTop = top;
                    }
                }
            };
            this.extend = function extend(obj, src) {
                for (var key in src) {
                    try {
                        //                        if (src.hasOwnProperty(key)) obj[key] = src[key];
                        obj[key] = src[key];
                    } catch (e) { }
                }
                return obj;
            };
            this.autoscroll = function (offset, poffset, parentNode) {
                //info.innerHTML=JSON.stringify(offset);
                //info.innerHTML+='<br>'+JSON.stringify(poffset);
//                var xb = this.xcell;
//                var yb = this.ycell;
                var xb = 0;
                var yb = 0;
//                var xb = -this.xcell;
//                var yb = -this.ycell;
                if (poffset.isBody == true) {
                    var scrollLeft = poffset.scrollLeft;
                    var scrollTop = poffset.scrollTop;
                    //var scrollbarwidth = window.pageXOffset ? (document.documentElement.scrollWidth - document.body.clientWidth) : (document.documentElement.clientWidth - document.body.offsetWidth); //Chrome & IE 16
                    //                  info.innerHTML = '<br>' + (document.documentElement.scrollWidth - document.body.clientWidth);
                    //                  info.innerHTML += '<br>' + (document.documentElement.clientWidth - document.body.offsetWidth);//IE
                    var scrollbarwidth = (document.documentElement.clientWidth - document.body.offsetWidth); //All
                    var scrollspeed = (offset.right + xb) - (poffset.right + scrollbarwidth);
                    //info.innerHTML+='<br>'+scrollspeed;
                    if (scrollspeed > 0) {
                        this.scrollLeft(parentNode, scrollLeft + scrollspeed);
                    }
                    scrollspeed = offset.left - (xb);
                    if (scrollspeed < 0) {
                        this.scrollLeft(parentNode, scrollLeft + scrollspeed);
                    }
                    scrollspeed = (offset.bottom + yb) - (poffset.bottom);
                    //info.innerHTML+='<br>'+scrollspeed;
                    if (scrollspeed > 0) {
                        this.scrollTop(parentNode, scrollTop + scrollspeed);
                    }
                    scrollspeed = offset.top - (yb);
                    if (scrollspeed < 0) {
                        this.scrollTop(parentNode, scrollTop + scrollspeed);
                    }
                } else {
                    var scrollLeft = offset.scrollLeft;
                    var scrollTop = offset.scrollTop;
                    var scrollbarwidth = parentNode.offsetWidth - parentNode.clientWidth; //17
                    var scrollbarheight = parentNode.offsetHeight - parentNode.clientHeight; //17
                    var scrollspeed = (offset.right + xb) - (poffset.right - scrollbarwidth);
                    //info.innerHTML+='<br>'+scrollspeed;
                    if (scrollspeed > 0) {
                        this.scrollLeft(parentNode, scrollLeft + scrollspeed);
                    }
                    scrollspeed = offset.left - (xb + poffset.left);
                    if (scrollspeed < 0) {
                        this.scrollLeft(parentNode, scrollLeft + scrollspeed);
                    }
                    scrollspeed = (offset.bottom + scrollbarheight + yb) - (poffset.bottom);
                    //info.innerHTML+='<br>'+scrollspeed;
                    if (scrollspeed > 0) {
                        this.scrollTop(parentNode, scrollTop + scrollspeed);
                    }
                    scrollspeed = offset.top - (yb + poffset.top);
                    if (scrollspeed < 0) {
                        this.scrollTop(parentNode, scrollTop + scrollspeed);
                    }
                }
            };

            this.el = el_drg;
            this.dragstarted = false;
            this.dragmoved = false;
            this.droppables = [];
            this.dropinfo = null;
            this.helper = null;
            this.xcell = 1;//snap to grid x must be >=1
            this.ycell = 1; //snap to grid y must be >=1
            this.parentNode = null;
            this.forceobjectmove = false;
            this.dragforce = 1;
            this.restricttoscrollview = true;
            this.restrictlimit = null;
            this.draghandle = null;
            this.axis = 'both'; //'both,x,y
            this.keyboardcontrol = false;
            this.keySpeed = 10;
            this.keys_on = false;
            this.start = function (e) {
                e = e || window.event;
                var relTarg = e.relatedTarget || e.fromElement;
                var relTarg = e.relatedTarget || e.toElement;
                this.mx = e.clientX;
                this.my = e.clientY;
                //                e.preventDefault();
                (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
                if (this.dragstarted == true) {
                    return this;
                }
                this.dragstarted = true;
                this.dragmoved = false;
                document.onselectstart = function (e) {
                    return false;
                };
                if (this.mousedown) {
                    this.mousedown(e);
                }
                this.kx = 0;
                this.ky = 0;
                if (this.keyboardcontrol == true) {
//                    this.starte = e;
                    this.cur_e = this.extend({},  e);
                    this.starte = null;
//                    this.cur_e = null;
                    this.canmove = true;
                    this.keys_on = false;
                    this.l_l = true;
                    this.w_l = true;
                    this.t_l = true;
                    this.h_l = true;
                    this.el.focus();
                }
                return false;
            };
            this.move = function (e) {
                e = e || window.event;
                //if (this.dragstarted == true) {
                //    this.el.innerHTML = 'move ' + e.clientX;
                //}
                if (this.keys_on == true) {
                    if (!e.keys_on) {
                        return;
                    }
                }
                if (this.dragstarted == true && (this.dragmoved == false && !e.keys_on ? (Math.abs(this.mx - e.clientX) > this.dragforce || Math.abs(this.my - e.clientY) > this.dragforce) : true)) {
                    //                    this.kx = e.clientX;
                    //                    this.ky = e.clientY;
                    //                    e.preventDefault();
                    if (!e.keys_on) {
                        (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
                    }
                    if (this.dragmoved == false) {
                        var offset = {};
                        var parentNode;
                        var eld;
                        if (this.helper) {
                            eld = this.helper;
                            if (this.helper.style.left == '') {
                                offset = this.getposition(this.el);
                                if (this.helper.parentNode != document.body) {
                                    var poffset = this.helper.parentNode.getBoundingClientRect();
                                    offset.left -= poffset.left + offset.scrollLeft;
                                    offset.top -= poffset.top + offset.scrollTop;
                                }
                                var scrollLeft = this.scrollLeft(this.el.parentNode);
                                var scrollTop = this.scrollTop(this.el.parentNode);
                                offset.left += scrollLeft;
                                offset.top += scrollTop;
                                this.helper.style.left = (offset.left) + 'px'; //+this.scrollLeft(this.el.parentNode)
                                this.helper.style.top = (offset.top) + 'px'; //+this.scrollTop(this.el.parentNode)
                            }
                            this.helper.style.display = '';
                        } else {
                            eld = this.el;
                        }
                        if (this.draghandle) {
                            eld = this.draghandle;
                        }
                        parentNode = eld.parentNode;
                        offset = eld.getBoundingClientRect();
                        if (this.parentNode) {
                            parentNode = this.parentNode;
                        }
                        var ol = 0, ot = 0;
                        this.parents = [];
                        if (parentNode != document.body) {
                            var poffset = parentNode.getBoundingClientRect();
                            ol = poffset.left;
                            ot = poffset.top;
                            var obj = parentNode;
                            while (obj.offsetParent) {
                                this.parents.push(obj);
                                if (obj == document.body) {
                                    break;
                                }
                                obj = obj.offsetParent;
                            }
                            //  if (obj == document.body) {
                            //      this.parents.push(obj);
                            //  }
                        }
                        var scrollLeft = this.scrollLeft(parentNode);
                        var scrollTop = this.scrollTop(parentNode);
                        this.initialMouseX = scrollLeft + e.clientX;
                        this.initialMouseY = scrollTop + e.clientY;
                        this.startX = offset.left + scrollLeft;
                        this.startY = offset.top + scrollTop;
                        this.ol = ol;
                        this.ot = ot;
                        var dx = this.startX - this.ol + scrollLeft + e.clientX - this.initialMouseX;
                        var dy = this.startY - this.ot + scrollTop + e.clientY - this.initialMouseY;
                        dx = Math.floor(dx / this.xcell) * this.xcell;
                        dy = Math.floor(dy / this.ycell) * this.ycell;
                        if (parentNode == document.body) {
                            this.sw = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
                            this.sh = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                        } else {
                            this.sw = parentNode.scrollWidth;
                            this.sh = parentNode.scrollHeight;
                        }
                        this.dx = dx;
                        this.dy = dy;
                        if (this.beforedrag) {
                            if (this.beforedrag(dx, dy, scrollLeft + e.clientX, scrollTop + e.clientY, e) === false) {
                                this.dragmoved = true;
                                this.end(e);
                                return false;
                            }
                        }
                        if (this.keyboardcontrol == true) {
                            this.starte = e;
                            this.cur_e = this.extend({}, this.starte);
                        }
                    } //this.dragmoved==false
                    this.dragmoved = true;
                    var parentNode;
                    var eld;
                    if (this.helper) {
                        eld = this.helper;
                    } else {
                        eld = this.el;
                    }
                    if (this.draghandle) {
                        eld = this.draghandle;
                    }
                    parentNode = eld.parentNode;
                    if (this.parentNode) {
                        parentNode = this.parentNode;
                    }
                    var offset = this.getoffset(eld, false);
                    var poffset = this.getoffset(parentNode, false);
                    for (var i = 0; i < this.parents.length; i++) {
                        var o1 = this.getoffset(this.parents[i], false);
                        var o2 = this.getoffset(this.parents[i].parentNode, false);
                        o1.left = offset.left;
                        o1.right = offset.right;
                        o1.top = offset.top;
                        o1.bottom = offset.bottom;
                        var scrollspeed = (o1.right + this.xcell) - (o2.right - 16);
                        this.autoscroll(o1, o2, this.parents[i].parentNode);
                    }
                    if (this.parents.length > 0) {
                        //offset = this.getoffset(eld,false);
                        //poffset = this.getoffset(parentNode,false);
                        if (parentNode != document.body) {
                            var poffset = parentNode.getBoundingClientRect();
                            this.ol = poffset.left;
                            this.ot = poffset.top;
                        }
                    }
                    var scrollLeft = this.scrollLeft(parentNode);
                    var scrollTop = this.scrollTop(parentNode);
                    var dx = this.startX - this.ol + scrollLeft + e.clientX - this.initialMouseX;
                    var dy = this.startY - this.ot + scrollTop + e.clientY - this.initialMouseY;
                    dx = Math.floor(dx / this.xcell) * this.xcell;
                    dy = Math.floor(dy / this.ycell) * this.ycell;
                    var b = true;
                    this.l_l = false;
                    this.w_l = false;
                    this.t_l = false;
                    this.h_l = false;
                    if (this.restricttoscrollview == true) {
                        //info.innerHTML = (dx + offset.width - this.xcell) + 'x' + (this.sw);
                        if ((dx + offset.width - this.xcell) > (this.sw)) {
                            //                            b = false;
                            dx = this.sw - offset.width;
//                            this.kx -= (this.keySpeed*1);
                            this.w_l = true;
                        }
                        if (dx < 0) {
                            //                        b = false;
                            dx = 0;
//                            this.kx += (this.keySpeed * 1);
                            this.l_l = true;
                        }
                        if ((dy + offset.height - this.ycell) > (this.sh)) {
                            //                        b = false;
                            dy = this.sh - offset.height;
//                            this.ky -= (this.keySpeed * 1);
                            this.h_l = true;
                        }
                        if (dy < 0) {
                            //                        b = false;
                            dy = 0;
//                            this.ky += (this.keySpeed * 1);
                            this.t_l = true;
                        }
                    }
                    if (this.restrictlimit) {
                        if ((dx + offset.width - this.xcell) > (this.restrictlimit.width)) {
                            dx = this.restrictlimit.width - offset.width;
                            //                            this.kx -= (this.keySpeed * 2);
                            this.w_l = true;
                        }
                        if (dx < this.restrictlimit.left) {
                            dx = this.restrictlimit.left;
                            //                            this.kx += (this.keySpeed * 2);
                            this.l_l = true;
                        }
                        if ((dy + offset.height - this.ycell) > (this.restrictlimit.height)) {
                            dy = this.restrictlimit.height - offset.height;
                            //                            this.ky -= (this.keySpeed * 2);
                            this.h_l = true;
                        }
                        if (dy < this.restrictlimit.top) {
                            dy = this.restrictlimit.top;
                            //                            this.ky += (this.keySpeed * 2);
                            this.t_l = true;
                        }
                    }
                    if (this.keyboardcontrol == true) {
                        //                        this.kx = this.startX - this.ol + scrollLeft + e.clientX - this.initialMouseX;
                        //                        this.ky = this.startY - this.ot + scrollTop + e.clientY - this.initialMouseY;
//                        info.innerHTML = e.clientX + 'x' + (dx - (this.startX - this.ol + scrollLeft - this.initialMouseX));
                        //                        this.kx = dx - (this.startX + this.ol + scrollLeft - this.initialMouseX);
                        //                        this.ky = dy - (this.startY + this.ot + scrollTop - this.initialMouseY);
                        //                        this.kx = dx - (this.startX  - this.initialMouseX+ this.ol + scrollLeft);
                        //                        this.ky = dy - (this.startY  - this.initialMouseY+ this.ot + scrollTop);
                        //                        if (this.kx < (poffset.left - (this.starte.clientX))) {
                        //                            this.kx = (poffset.left - (this.starte.clientX));
                        //                        }
                        this.cur_e.clientX=(dx - (this.startX - this.ol + scrollLeft - this.initialMouseX));
                    }
                    if (b == true) {
                        if (this.axis == 'both' || this.axis == 'x') {
                            eld.style.left = dx + 'px';
                        }
                        if (this.axis == 'both' || this.axis == 'y') {
                            eld.style.top = dy + 'px';
                        }
                        this.autoscroll(offset, poffset, parentNode);
                        this.dx = dx;
                        this.dy = dy;
                        this.dropinfo = null;
                        for (var n = this.droppables.length - 1; n >= 0; n--) {
                            //                            this.droppables[n].style.border = '1px solid black';
                            if (this.droppables[n] != this.el) {
                                //var x=dx+this.initialMouseX-this.startX-this.ol;
                                //var y=dy+this.initialMouseY-this.startY-this.ot;
                                var x = e.clientX;
                                var y = e.clientY;
                                this.dropinfo = this.hittest(this.droppables[n], x, y);
                                if (this.dropinfo !== null) {
                                    //                            dropped.target.style.border = '1px solid red';
                                    break;
                                }
                            }
                        }
                        if (this.dragover) {
                            this.dragover(this.dropinfo, this.el, dx, dy, scrollLeft + e.clientX, scrollTop + e.clientY, e);
                        }
                    }
                }
            };
            this.end = function (e) {
                e = e || window.event;
                //this.el.innerHTML = 'end ' + e.clientX;
                if (this.dragstarted == true) {
                    this.dragstarted = false;
                    document.onselectstart = null;
                    if (this.dragmoved == true) {
                        (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();
                        if (this.helper) {
                            if (this.forceobjectmove == true && this.dragmoved == true) {
                                this.el.style.left = this.dx + 'px';
                                this.el.style.top = this.dy + 'px';
                            }
                            this.helper.style.display = 'none';
                        }
                        if (this.dragdrop) {
                            this.dragdrop(this.dropinfo, this.el, this.dx, this.dy, e);
                        }
                        this.dragmoved = false;
                        this.canmove = false;
                        return false;
                    } else {
                        if (this.click) {
                            this.click(e);
                        }
                    }
                }
                if (this.mouseup) {
                    this.mouseup(e);
                }
            };
            this.keycontrol = function (e) {
                e = e || window.event;
                if (this.canmove !== true) {
                    return true;
                }
                this.dragstarted = true;
                this.keys_on = true;
                if (this.starte) {
                    var key = e.keyCode;
                    switch (key) {
                        case 37: case 63234: // left
                            if (this.l_l == false) {
                                //                                this.kx -= ;
                                this.cur_e.clientX -= this.keySpeed ;
                            }
                            break;
                        case 39: case 63235: // right
                            if (this.w_l == false) {
//                                this.kx += this.keySpeed;
                                this.cur_e.clientX += this.keySpeed ;
                            }
                            break;
                        case 38: case 63232: // up
                            if (this.t_l == false) {
//                                this.ky -= this.keySpeed;
                                this.cur_e.clientY -= this.keySpeed ;
                            }
                            break;
                        case 40: case 63233: // down
                            if (this.h_l == false) {
                                //                                this.ky += this.keySpeed;
                                this.cur_e.clientY += this.keySpeed ;
                            }
                            break;
                        case 13: case 27:
                            this.end(e);
                            return false;
                        default:
                            return true;
                    }
                    //                var ne = this.extend({}, this.starte);
                    //                    ne.keys_on = true;
                    //                ne.clientX += this.kx;
                    //                ne.clientY += this.ky;
//                    this.cur_e.clientX = this.starte.clientX + this.kx;
//                    this.cur_e.clientY = this.starte.clientY + this.ky;
                }
                    this.cur_e.keys_on = true;
                this.move(this.cur_e);
                (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
            };
            this.bindevents = function (b) {
                var fn;
                if (b == true) {
                    fn = this.addEventSimple;
                } else {
                    fn = this.removeEventSimple;
                }
                var _this = this;
                fn(this.el, 'mousedown', function (e) {
                    return _this.start(e);
                });
                fn(this.el, 'mousemove', function (e) {
                    return _this.move(e);
                });
                fn(this.el, 'mouseup', function (e) {
                    return _this.end(e);
                });
                fn(document, 'mousemove', function (e) {
                    return _this.move(e);
                });
                fn(document, 'mouseup', function (e) {
                    return _this.end(e);
                });
                fn(document, 'click', function (e) {
                    return _this.end(e);
                });
                this.addEventSimple(this.el, 'selectstart', function (e) {
                    return false;
                });
                if (this.el.addEventListener) {
                    this.el.addEventListener('touchstart', function (e) {
                        //_this.el.innerHTML = 'start ' + e.touches[0].clientX;
                        e.preventDefault();
                        _this.start(e.touches[0]);
                    });
                    this.el.addEventListener('touchmove', function (e) {
                        //_this.el.innerHTML = 'move ' + e.touches[0].clientX;
                        e.preventDefault();
                        _this.move(e.touches[0]);
                    });
                    this.el.addEventListener('touchend', function (e) {
                        //_this.el.innerHTML = 'end ' + e.touches[0].clientX;
                        e.stopPropagation();
                        e.preventDefault();
                        _this.end(e.touches[0]);
                    });
                    document.addEventListener('touchmove', function (e) {
                        e.preventDefault();
                        _this.move(e.touches[0]);
                    });
                    document.addEventListener('touchend', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        _this.end(e.touches[0]);
                    });
                }
                if (this.keyboardcontrol == true) {
                    var tabIndex = this.el.getAttribute('tabIndex');
                    if (!tabIndex) {
                        tabIndex = 0;
                    }
                    if (b == true) {
                        this.el.setAttribute('tabIndex', 0);
                    } else {
                        if (tabIndex == 0) {
                            this.el.removeAttribute('tabIndex');
                        }
                    }
                    fn(this.el, 'keydown', function (e) {
                        return _this.keycontrol(e);
                    });
                }
            };
            this.attach=function(){
                this.bindevents(true);
            };
            this.detach=function(){
                this.bindevents(false);
            };
            this.reattach=function(){
                this.bindevents(false);
                this.bindevents(true);
            };
            this.attach();
            return this;
        } /*drag_auto_scroll*/