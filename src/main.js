define(function(require) {
	require("common/plugin/function");
	//require('common/jquery.validate');
	require("common/datepicker");
	var loading = require('loading/loading');
	var legendCanvas = document.createElement('canvas'),
		legendCtx = legendCanvas.getContext('2d'),
		gradientCfg = {},
		heatmap,
		businessdData = {
			10001 : {
				url : 'http://mp.weixin.qq.com/mp/lifedetail?action=list&bid=dianping_1916992',
				name : '微信poi'
			}/*,
			10002 : {
				url : 'http://mp.weixin.qq.com/mp/lifedetail?action=list&bid=dianping_1916992&uin=NzQ4NTIxNQ%3D%3D&key=dcce3f7f97fcd78b7f43988ac09258e3b231ee7cf1a080e53797091db9f91b13b8ca58de0d2bbff363744b44b7893515&devicetype=Windows-QQBrowser&version=61000901&lang=zh_CN&pass_ticket=gI3%2FCMLGwSZc0ENVxsVjy8nbOsqqOyqUJpoMaIbKCBM%3D',
				name : '微信poi-团购列表页'
			}*/
		}

	legendCanvas.width = 100;
	legendCanvas.height = 10;
	function formatTime(date,formatStr){
		//格式化时间
		var	arrWeek=['日','一','二','三','四','五','六'],
		str=formatStr
			.replace(/yyyy|YYYY/,date.getFullYear())
			.replace(/yy|YY/,addZero(date.getFullYear() % 100,2)	)
			.replace(/mm|MM/,addZero(date.getMonth()+1,2))
			.replace(/m|M/g,date.getMonth()+1)
			.replace(/dd|DD/,addZero(date.getDate(),2)	)
			.replace(/d|D/g,date.getDate())
			.replace(/hh|HH/,addZero(date.getHours(),2))
			.replace(/h|H/g,date.getHours())
			.replace(/ii|II/,addZero(date.getMinutes(),2))
			.replace(/i|I/g,date.getMinutes())
			.replace(/ss|SS/,addZero(date.getSeconds(),2))
			.replace(/s|S/g,date.getSeconds())
			.replace(/w/g,date.getDay())
			.replace(/W/g,arrWeek[date.getDay()]); 
		return str;
	}
	function addZero(v,size){
		for(var i=0,len=size-(v+"").length;i<len;i++){
			v="0"+v;
		};
		return v+"";
	}
	function showBubble(txt){
		var bubble = $('.alert');
		bubble.html(txt).show();
		setTimeout(function(){
			bubble.fadeOut();
		},500)
	}
	function initDom(){
		$('.datetimepicker input').each(function(){
	        //console.log(this);
	        $(this).datepicker({
	        	defaultDate:-1,
	        	dateFormat: "yy-mm-dd",	        	
	        	maxDate:'-1d'
	        }); 
	    });
	    $('.datetimepicker input').each(function(){
	        $(this).val(formatTime(new Date(new Date().getTime() -24*60*60*1000),'yyyy-mm-dd')); 
	    });
	    heatmap = h337.create({
			container: $('#heatmapContainer')[0],
			maxOpacity: .5,
			radius: 16,
			blur: .75,
			defaultXField:'pos_x',
			defaultYField:'pos_y',
			defaultValueField: 'hit_num',
			/*gradient: {
                    0.20: "rgb(0,0,255)",
                    0.45: "rgb(0,255,255)",
                    0.65: "rgb(0,255,0)",
                    0.85: "yellow",
                    1.0: "rgb(255,0,0)"
                },*/
			onExtremaChange: function onExtremaChange(data) {
				updateLegend(data);
			}
		});
		initBusiness();
	}	
	function validate(){
		//$('#searchForm').find('.frm_tips').html('');
		//$("#searchForm").valid();
		var url_id = $("select[name=url_id]").val(),
			url = $("input[name=url]").val(),
			os = $("select[name=os]").val(),
			width = $("select[name=width]").val(),
			begin_date = $("input[name=begin_date]").val(),
			end_date = $("input[name=end_date]").val();
		var tips = [{
						name : 'url_id',
						val : url_id,
						required : '业务不能为空'
					},{
						name : 'width',
						val : width,
						required : '页面宽度不能为空'
					},{
						name : 'begin_date',
						val : begin_date,
						required : '开始时间不能为空'
					},{
						name : 'end_date',
						val : end_date,
						required : '结束时间不能为空'
					}];
		for (var i = 0; i < tips.length; i++) {
			if(!tips[i].val){				
				showBubble(tips[i].required);
				return false;
			}
			
		};
		if(new Date(end_date) -  new Date(begin_date) > 1000*60*60*24*7){
			showBubble('时间间隔不建议超过7天');
			return false;
		}
		return true;
	}
	function getUrl(url_id){	

		return businessdData[url_id]['url'];
	}
	function initBusiness(){
		var template = '<option value="#id#">#name#</option>',
			html = '';
		for (var item in businessdData){
			html += template.replace('#id#',item).replace('#name#',businessdData[item]['name']);
		}
		$('#url_id').append(html);
		for (var item in businessdData){
			getA8Key(businessdData[item]['url'],item);
		}
	}
	function updateLegend(data) {
		if (data.gradient != gradientCfg) {
			gradientCfg = data.gradient;
			var gradient = legendCtx.createLinearGradient(0, 0, 100, 1);
			for (var key in gradientCfg) {
			  gradient.addColorStop(key, gradientCfg[key]);
			}
			legendCtx.fillStyle = gradient;
			legendCtx.fillRect(0, 0, 100, 10);
		}
	}
	function generate() {
		var t = DATA.t;
		var init = +new Date;
		var max = 1,min = 1;
		var totalCount = 0;
		for (var i = 0; i < t.length; i++) {
            totalCount += t[i].hit_num;
            max = Math.max(t[i].hit_num, max);
            //min = Math.min(t[i].hit_num, mix);
        }
        console.log('max:'+max);
		heatmap.setData({
			//min: min,
			max: max,
			data: t
		});
		console.log('took ', (+new Date) - init, 'ms');		
	}
	function getA8Key(url,id){
		$.ajax({
			type:'get',
			url:'/geta8key?url=',
			data:'',
			dataType:'json',
			success:function(data){
				//{"ret":0,"data":"www?uin=MjIyNTE0NzUzNw==&key=b3e620553f043c52fabfbc5fbae8110fba0de42a2e1b8cb464664f67724a4211ed4f90d870e99217b4fe57f977562a44"}
				if(data.ret == 0){
					businessdData[id]['url'] = businessdData[id]['url'] + '&' + data.data;
				}
				$('#search').click();
			},
			error:function(data){
				
			}
		});
	}		
	function getHeatmapData(){
		loading.show();
		var formData = $('#searchForm').serializeObject();	
		//处理url
		var url_id = $("select[name=url_id]").val();
		//var url = $("input[name=url]").val();
		var url = getUrl(url_id);
		$('#siframe').attr('src',url);
		//处理width
		var width = $("select[name=width]").val();
		$('#siframe').css('width',width);
		$('#heatmapContainer').css('width',width);
		$('.heatmap-canvas').css('width',width);
		$('.operationZone').css('margin-left',(parseInt(width)+20)+ 'px');
		//处理时间
		formData.begin_date = formatTime(new Date(formData.begin_date),'yyyymmdd');
		formData.end_date = formatTime(new Date(formData.end_date),'yyyymmdd');
		

		$.ajax({
			type:'get',
			url:'/view_heat_map?action=view',
			data:formData,
			success:function(data){
				var tmp = eval('(' + data + ')'),
					tmpClick;
				if(tmp.ret == 0){
					tmpClick = tmp.page_click_info
				}
				var heatmapData = eval('(' + tmpClick + ')');
				DATA.t = heatmapData.page_click_info;
				generate();
				$('.heatmap-canvas').show();
				calulateTotalCount();
				$('#heatmapContainer').show();
				loading.hide();
			},
			error:function(data){
				clearHeatmap();
			}
		});
	}
	function clearHeatmap(){
		//数据出错，请稍后再试
		showBubble('网络错误，请稍后再试。');
		$('.heatmap-canvas').hide();
	}
	function selectAreaStart(event) {
        var minLeft, minTop, maxLeft, maxTop;
        var off = document.querySelector('.heatmap-canvas').getBoundingClientRect();
        minLeft = off.left;
        minTop = off.top + document.body.scrollTop;
        maxLeft = minLeft + off.width - 4; //remove boder width
        maxTop = minTop + off.height;
        var areaCount = $('.divDragArea').length;
        var id = "divDragArea" + areaCount;
        var x = event.pageX;
        var y = event.pageY;
        $(document).mousemove(docMove);
        $(document).mouseup(docUp);
        var left, top, width, height;   
        function docMove(mEvent) {
	        var newX = mEvent.pageX;
	        var newY = mEvent.pageY;

	        newX = Math.max(minLeft, Math.min(newX, maxLeft));
	        newY = Math.max(minTop, Math.min(newY, maxTop));
	        if ($('#' + id).length == 0 && Math.abs(x - newX) > 4 && Math.abs(y - newY) > 4) {
	            var divArea = $('<div></div>');
	            divArea.addClass("divDragArea"); //.text(areaCount+1);
	            divArea.attr('id', id);
	            $(document.body).append(divArea);
	            divArea.css({
	                left: x,
	                top: y
	            }).height(5).width(5);
	        }
	        if ($('#' + id).length == 1) {
	            var divArea = $('#' + id);
	            left = Math.min(x, newX);
	            top = Math.min(y, newY);
	            width = Math.abs(Math.max(x, newX) - left);
	            height = Math.abs(Math.max(y, newY) - top);

	            divArea.css({
	                left: left,
	                top: top
	            }).width(width).height(height);
	        }
	    }
	    function docUp(mEvent) {
	        //divArea.remove();
	        $(document).unbind("mousemove");
	        $(document).unbind("mouseup");
	        if ($('#' + id).length == 0 || width < 10 || height < 10) {
	            $('#' + id).remove();
	            return;
	        }
	        var off = document.querySelector('.heatmap-canvas').getBoundingClientRect()
	        var x1 = left - off.left;
	        var y1 = top - off.top - document.body.scrollTop
	        var x2 = x1 + width;
	        var y2 = y1 + height;
	        var rectObj = {
	            x1: x1,
	            y1: y1,
	            x2: x2,
	            y2: y2
	        };
	        var tItem = {
		        tabid: "divAreaData"+areaCount,
		        text: "区域"+(areaCount+1)+"pv/uv",
		        showClose: false
	        }
	        var areaData = getCountAsArea(left - off.left, width, top - off.top - document.body.scrollTop, height);
	        $('#' + id).html('<div style="z-index: 1010; position: relative; float: right;"><a style="height: 10px; overflow: hidden; text-indent: -100px; cursor: pointer; margin-top: 1px; margin-right: 1px; float: right; width: 10px; text-decoration: none; background: url(http://discuz.gtimg.cn/stats/images/heatmap/cls_small.gif) 0px 0px no-repeat scroll transparent;" class="closeZone">关闭</a></div>');
	        $('#' + id).append("点击次数:" + " (" + areaData.pv + ")");
	    }
	    function getCountAsArea(left, width, top, height) {
	        //CurrrentData
	        var CurrrentData = DATA.t;
	        var filterData = $.grep(CurrrentData, function(item) {
	            return item.pos_x >= left && item.pos_x <= (left + width) && item.pos_y >= top && item.pos_y <= (top + height);
	        });
	        var count = 0;
	        var uv = 0;
	        $(filterData).each(
	            function(index, item) {
	                count += item.hit_num;
	                uv += item.hit_num;
	            }
	        );
	        return {
	            pv: format1w(count),
	            uv: format1w(uv)
	        }
	    }
    }
	function format1w(data) {
        if (data >= 1000) {
            return (data / 10000).toFixed(2) + "w";
        } else {
            return data;
        }
    } 
    function clearDragArea() {

        $('.divAreaDataItem,.divDragArea').remove();
    } 
    function calulateTotalCount(){
        var CurrrentData = DATA.t; 
        var count = 0;
        $(CurrrentData).each(
            function(index, item) {
                count += item.hit_num;
            }
        );
        $('#totalCount').show();
        $('#count_num').html(format1w(count));
    }  
	function bindEvent(){

		$('#search').click(function(e){
			//console.log($('#searchForm').serialize());
			clearDragArea();
			$('#heatmapContainer').hide();
			var result = validate();
			if(result){
				getHeatmapData();
			}			
		});
		$('#search').click();
		$('.heatmap-canvas').mousedown(selectAreaStart);
		$('#clearHeatmap').click(function(e){
			$('.heatmap-canvas').remove();
		});
		$('#clearSelector').click(function(e){
			clearDragArea();
		});
		$("body").delegate(".closeZone","click",function(e){
			var target = $(e.target);
			//alert(target);
			var parent = target.parent().parent();
			parent.remove();
		});
	}
	//函数入口
	initDom();
	bindEvent();
});
