(function(w,d,undefined) {
    var HeatmapReport = {};
    var Util = {
    	getUA : function(){
    		return navigator.userAgent;
    	},
    	getOS : function(ua){
    		var oss = [/android[^;]*/gi, /\w* OS [^ ]*/gi,/Windows/gi];
	        var i, o;
	        ua = ua || this.getUA();
	        for (i = 0; i < oss.length; i++) {
	            o = ua.match(oss[i]);
	            if (o) {
	                return o[0];
	            }
	        }
	        return 'unknown';
    	},
    	getBrowser : function(ua){
            //ie5、ie6、ie7、ie8、ie9、ie10、qq、chrome、firefox、safari、se360、theworld、maxthon、other
    		var browsers = [/mqqbrowser/gi, /safari/gi,/MSIE/gi,/Chrome/gi];
	        var b, i;
	        ua = ua || this.getUA();
	        for (i = 0; i < browsers.length; i++) {
	            b = ua.match(browsers[i]);
	            if (b) {
	                return b[0];
	            }
	        }
	        return 'unknown';
    	},
    	getWidth:function() {
            return w.innerWidth||d.documentElement.clientWidth;
        },
        getHeight:function() {
            return w.innerHeight||d.documentElement.clientHeight;
        },
        getDocumentHeiht :function(){
			return document.body.scrollHeight;
		},
        isPc:/(WindowsNT)|(Windows NT)|(Macintosh)/i.test(navigator.userAgent),
        getMetered:function(){
            return navigator.connection && navigator.connection.metered || 'unknown';
        },
        obj2query : function(obj) {
            var arr = [];
            for(var key in obj) {
                arr.push(key + "=" + encodeURIComponent(obj[key]||""));
            }
            return arr.join("&");
        },
        parseUrl : function(url) {
            var a =  document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':',''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function(){
                    var ret = {},
                        seg = a.search.replace(/^\?/,'').split('&'),
                        len = seg.length, i = 0, s;
                    for (;i<len;i++) {
                        if (!seg[i]) { continue; }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/([^\/?#]+)$/i) || [,''])[1],
                hash: a.hash.replace('#',''),
                path: a.pathname.replace(/^([^\/])/,'/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
                segments: a.pathname.replace(/^\//,'').split('/')
            };
        },
        getBusinessUrl : function(){
            var href = location.href,
                parseUrl = this.parseUrl(href),
                params = parseUrl.params;
            //href中包涵了uin、key、devicetype、version、lang这几个登录态多余信息
            delete params.uin;
            delete params.key;
            delete params.devicetype;
            delete params.version;
            delete params.lang;
            delete params.from;
            delete params.isappinstalled;
            delete params.pass_ticket;
            var reurl = parseUrl.protocol + '://' + parseUrl.host + parseUrl.path + '?' + this.obj2query(params) + '#' + parseUrl.hash;
            return reurl;
        },
        ajax : function(obj){
	        var type  = (obj.type || 'GET').toUpperCase();
	        var url   = obj.url;
	        var async = typeof obj.async == 'undefined' ? true : obj.async;
	        var data  = typeof obj.data  == 'string' ? obj.data : null;
	        var xhr   = new XMLHttpRequest();
	        var timer = null;
	        //alert(url);
	        xhr.open(type, url, async);
	        xhr.onreadystatechange = function(){
	            if( xhr.readyState == 3 ){
	                obj.received && obj.received(xhr);
	            }
	            if( xhr.readyState == 4 ){
	                if( xhr.status >= 200 && xhr.status < 400 ){
	                    clearTimeout(timer);
	                    obj.success && obj.success(xhr.responseText);
	                }
	                obj.complete && obj.complete();
	                obj.complete = null;
	            }
	        };
	        if( type == 'POST' ){
	            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	        }
	        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	        xhr.send(data);
	        if( typeof obj.timeout != 'undefined' ){
	            timer = setTimeout(function(){
	                xhr.abort("timeout");
	                obj.complete && obj.complete();
	                obj.complete = null;
	            }, obj.timeout);
	        }
	    }
    }
    var options = {
        url: "/mp/heat_map?", //数据上报的接口      
        url_id: 0, //当前上报的链接对应的业务id
        onProcessUrl: false,
        callback: false,
        data:[],
        type:'POST'
    };

    
    function init(userOptions) {
        for (var key in userOptions) {
            options[key] = userOptions[key];
        }
        tap(document, function(event){
        	//console.log(event.target, event.srcElement);
	        var endX = touchable ? event.changedTouches[0].pageX : event.pageX;
	        var endY = touchable ? event.changedTouches[0].pageY : event.pageY;
	       	options.data.push({
	        	pos_x:endX,
	        	pos_y:endY,
	        	hit_num:1
	        });
	        //sendData();
        });
    }

    var eventName = "click";
    if ("ontouchstart" in w) {
        eventName = 'touchend';
    }

    var touchable = 'ontouchstart' in w;
    w.touchstart = touchable ? 'touchstart' : 'mousedown';
    w.touchmove = touchable ? 'touchmove' : 'mousemove';
    w.touchend = touchable ? 'touchend' : 'mouseup';
    w.touchcancel = touchable ? 'touchcancel' : 'mouseup';

    function tap(el, tapHandler, startHandler, endHandler, halt) {
        var moved = false;
        var sx, sy;

        el.addEventListener(touchstart, function(e) {
            sx = touchable ? e.touches[0].clientX : e.clientX;
            sy = touchable ? e.touches[0].clientY : e.clientY;

            if ( !! halt) {
                e.stopPropagation();
            }
            moved = false;
            startHandler && startHandler(e);
        }, false);
        el.addEventListener(touchend, function(e) {
            try {
                if ( !! halt) {
                    e.stopPropagation();
                }
                var endX = touchable ? e.changedTouches[0].clientX : e.clientX;
                var endY = touchable ? e.changedTouches[0].clientY : e.clientY;
                if (Math.abs(sx - endX) < 10 && Math.abs(sy - endY) < 10) {
                    tapHandler(e);
                }
                endHandler && endHandler(e);
            } catch (ex) {}
        }, false);
    }

    function sendData() {
        var reportData = {
        	ua:Util.getBrowser(),
	        os:Util.getOS(),
	        net:Util.getMetered(),
	        width:Util.getWidth(),
	        height:Util.getHeight(),
	        href:Util.getBusinessUrl(),
            url_id:options.url_id,
	        page_info:JSON.stringify({
                page_click_info:options.data
            })
        };
        //ajax上报方式
        Util.ajax({
        	type:options.type,
        	url:options.url,
        	data:Util.obj2query(reportData),
        	success:function(){
        		options.callback && options.callback();
        	}
        });
        //imgReport("http://statistics.html5.qq.com/click?"+Util.obj2query(reportData));
        return false;
    }
    function imgReport(url){
    	var _img = new Image(1, 1);
		_img.src = url;
    }
    window.onbeforeunload = function(){    
	    sendData();
	}
    
    HeatmapReport = {
        init: init
    }
    w.HeatmapReport = HeatmapReport;

})(window,document);
