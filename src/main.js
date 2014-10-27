define(function(require) {
	require("common/plugin/function");
	var legendCanvas = document.createElement('canvas'),
		legendCtx = legendCanvas.getContext('2d'),
		gradientCfg = {};

	legendCanvas.width = 100;
	legendCanvas.height = 10;

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
	};
	var heatmap = h337.create({
		container: $('#heatmapContainer')[0],
		maxOpacity: .5,
		radius: 16,
		blur: .75,
		defaultXField:'pos_x',
		defaultYField:'pos_y',
		defaultValueField: 'hit_num',
		onExtremaChange: function onExtremaChange(data) {
			updateLegend(data);
		}
	});
	var generate = function() {
		var extremas = [(Math.random() * 1000) >> 0,(Math.random() * 1000) >> 0];
		var max = Math.max.apply(Math, extremas);
		var min = Math.min.apply(Math,extremas);
		var t = DATA.t;
		var init = +new Date;
		// set the generated dataset
		heatmap.setData({
			min: min,
			max: max,
			data: t
		});
		console.log('took ', (+new Date) - init, 'ms');
	};
	function getA8Key(url){
		$.ajax({
			type:'get',
			url:'/',
			data:formData,
			success:function(data){
				
			},
			error:function(data){
				generate();
			}
		});
	}
	function getHeatmapData(){
		var formData = $('#searchForm').serializeObject();
		$.ajax({
			type:'get',
			url:'/',
			data:formData,
			success:function(data){
				generate();
			},
			error:function(data){
				generate();
			}
		});
	}
	function bindEvent(){
		$('#search').click(function(e){
			console.log($('#searchForm').serialize());
			getA8Key($('#url').val());
		});
	}
	//函数入口
	
	bindEvent();
});
