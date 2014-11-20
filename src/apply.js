define(function(require) {
	require("common/plugin/function");
	require("common/datepicker");
	require("common/template.js");
	template.openTag = '{#';     // 设置逻辑语法开始标签
	template.closeTag = '#}';    // 设置逻辑语法结束标签
	var initId = 10001;
	var hashData = [{
			id:10002,
			name:'#hash1'
		},{
			id:10003,
			name:'#hash2'
		}];
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
	function initDom(){
		initHash();
		initCode();
	}
	function initHash(){
		var len = hashData.length,html='';
		if(len>0){
			for (var i = 0; i < hashData.length; i++) {
				hashData[i]['id'] = (initId + i + 1);
			};
			for (var i = 0; i < hashData.length; i++) {
				html += template.render('hash_tpl',{data:hashData[i],i:i+1});
			};
			$('#hashContainer').html('');
			$('#hashContainer').append(html);
		}else{
			$('#hashContainer').html('');
		}
	}
	function initCode(){
		$('#code').html(template.render('code_tpl',{data:hashData,initId:initId}));
	}
	function bindEvent(){
		$('#add').click(function(e){
			var len = hashData.length,
				id = hashData.length ? hashData[hashData.length-1]['id'] : initId+1;
			hashData.push({
				id:id+1,
				name:''
			});
			initHash();
		});
		$(".row").delegate(".del","click",function(e){
			var target = $(e.target),id = target.attr('id');
			for (var i = 0; i < hashData.length; i++) {
				if(hashData[i]['id'] == id){
					hashData.splice(i,1);
				}
			};
			initHash();
			initCode();
		});	
		$(".row").delegate(".hash","change",function(e){
			var target = $(e.target),id = target.data('id');
			for (var i = 0; i < hashData.length; i++) {
				if(hashData[i]['id'] == id){
					hashData[i]['name'] = $(this).val();
					console.log($(this).val());
				}
			};
			initCode();
		});	
		$('#generate').click(function(e){
			initCode();
		});
		$('#save').click(function(e){
			/*$.ajax({
				url:'/',
				type:'post',
				data:{},
				success:function(data){

				},
				error:function(data){

				}
			})*/
			alert("新增业务可以联系fredshare");
		});
	}
	//函数入口
	initDom();
	bindEvent();
});
