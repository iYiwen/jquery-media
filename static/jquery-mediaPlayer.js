/**
 * Created by Zed on 2015/4/16.
 *
 *  example :
 *
 *  new MediaPlayer({
 *      flip : true,   //是否禁止缩略图翻页，默认为false
 *      data : function(callback){
 *          $.get("xx.com/api",function(data){
 *              callback(data)//一定要放数组
 *          })
 *      }
 *  })
 *
 *
 *
 */

(function ($) {
    function MediaPlayer(elm,options){
        this.$element = elm;
        this.flip = options.flip || false;
        this.mediaMap =options.data;
        this.init();
    }

    MediaPlayer.prototype = {
        createDom : function (){
            var template = '<div class="player">' +
                    '<div class="screen">' +
                '<a href="javascript:;" class="screen-priv-btn"><</a>' +
                '<a href="javascript:;" class="screen-next-btn">></a>' +
                '<div class="screen-content" id="screen-block">' +
                '</div>' +
                '<div class="thumbnail">' +
                '<a href="javascript:;" class="thumbnail-priv-btn"></a>' +
                '<a href="javascript:;" class="thumbnail-next-btn"></a>' +
                '<ul class="thumbnail-list" id="samllPic"></ul>' +
                '</div>' +
                '</div>';
            this.$element.html(template);
        },
        getMediaType : function (media) {
            var imgLabel = "<img src='"+media.src+"' width='100%' height='100%'>",
                audioLabel = '<div class="music-bg" style="line-height:'+ this.screenHeight +'px;height: '+ this.screenHeight +'px"></div><audio controls style="width: 100%;height: 100%">'+
                    '<source src="'+media.src+'" type="audio/mpeg">'+
                    +'<source src="'+media.src+'" type="audio/ogg">'+
                    '<embed width="100%" src="'+media.src+'">'+
                    'Your browser does not support this audio format.'+
                    '</audio>',
                videoLabel = '<video width="100%" height="100%" controls>' +
                    '<source src="'+media.src+'" type="video/mp4">' +
                    '<source src="'+media.src+'" type="video/ogg">' +
                    '<source src="'+media.src+'" type="video/webm">' +
                    '<object data="'+media.src+'" width="100%">' +
                    '<embed src="'+media.src+'" width="100%">'+
                    '</object>你的浏览器不支持</video>';
            if (media.type == "image"){
                return imgLabel;
            }
            if (media.type == "audio"){
                return audioLabel;
            }
            if (media.type == "video"){
                return videoLabel;
            }
        },
        render : function () {
            this.createDom();
            this.parentHeight = $($(".player").parent()).css("height");
            this.thumbnailHeight = parseInt(this.parentHeight) * 0.19;
            this.screenHeight = parseInt(this.parentHeight) - this.thumbnailHeight;
            var _this = this,
                timer = null,
                index = 0,
                page = 0,
                pageTotal;


            $(".player").css({"width":"100%","height":this.parentHeight});
            var playerWidth = parseInt($(".player").css("width"));
            var _count = 20;
            function getCount() {
                var _w = playerWidth / _count;
                if (_w < 90) {
                    _count--;
                    getCount();
                } else if (_w > 120) {
                    _count++;
                    getCount();
                }
                return _count;
            }
            _count = getCount();
            $(".screen").css("height",this.screenHeight);
            $("#screen-block").css("height",this.screenHeight)
                .on("mouseover", function () {
                    clearTimeout(timer);
                    $(".screen").addClass("screen-btn-show");
                })
                .on("mouseout", function () {
                    timer = setTimeout(function () {
                        $(".screen").removeClass("screen-btn-show");
                    },1000)
                });
            if (this.flip) {
                $(".thumbnail").addClass("flip");
            }
            this.mediaMap(function (data) {
                var oLi = "";
                pageTotal = Math.ceil(data.length / _count);
                var imgWidth = (playerWidth-((_count-1)*10)) / _count;
                for (var i = 0; i < data.length; i++) {
                    oLi += '<li><a href="javascript:;"><img src="'+ data[i].thumbnail +'" alt="" width="'+imgWidth+'" height="'+_this.thumbnailHeight+'"/></a>';
                    if (data[i].type == "video"){
                        oLi += "<div class='video-mask' style='height: "+_this.thumbnailHeight+"px; line-height:"+ _this.thumbnailHeight +"px'><div class='btn-bg'></div></div>"
                    }

                    if (data[i].type == "audio"){
                        oLi += "<div class='audio-mask'  style='height: "+_this.thumbnailHeight+"px; line-height:"+ _this.thumbnailHeight +"px'></div>"
                    }

                    oLi+='</li>';
                }
                $("#samllPic").append(oLi)
                    .css({"width":((playerWidth/_count)+(_count-1)*10)*data.length,"height":_this.thumbnailHeight});

                $(".thumbnail")
                    .on("mouseover", function () {
                    $(this).addClass("btn-show");
                })
                    .on("mouseout",function(){
                        timer = setTimeout(function () {
                            $(this).removeClass("btn-show");
                        },1000)
                    });

                var liCount = $("#samllPic li");
                _this.seleced(liCount,index);
                for (var k = 0; k < liCount.length; k++) {
                    $(liCount[k]).on("click",function () {
                        var selecedIndex = $(this).attr("index");
                        index = selecedIndex;
                        _this.toggle("#screen-block",liCount,data,index);
                        $("#screen-block").html(_this.getMediaType(data[index]));
                        _this.seleced(liCount,index);
                    });
                }
                _this.toggle("#screen-block",liCount,data,index);

                $(".thumbnail-priv-btn")
                    .on("mouseover",function(){
                    clearTimeout(timer);
                    })
                    .on("mouseout", function () {
                        $(".thumbnail").removeClass("btn-show");
                    })
                    .on("click",function(){
                        page--;
                        if (page < 0) {page = 0;return};
                        _this.doMove("#samllPic",playerWidth,page);

                    });
                $(".thumbnail-next-btn")
                    .on("mouseover",function(){
                        clearTimeout(timer);
                    })
                    .on("mouseout", function () {
                        $(".thumbnail").removeClass("btn-show");
                    })
                    .on("click",function(){
                        page++;
                        if (page > pageTotal-1) {page = pageTotal-1;return};
                        _this.doMove("#samllPic",playerWidth,page);

                    });
                $(".screen-priv-btn")
                    .on("click", function () {
                        index--;
                        if (index < 0) index = 0;
                        _this.toggle("#screen-block",liCount,data,index);
                        if (index < _count*(page+1)-_count) {
                            page--;
                            if (page < 0) {page = 0;return};
                            _this.doMove("#samllPic",playerWidth,page);
                        }

                    })
                    .on("mouseover",function(){
                        clearTimeout(timer);
                    })
                    .on("mouseout", function () {
                        $(".screen").removeClass("screen-btn-show");
                    });
                $(".screen-next-btn")
                    .on("click", function () {
                        index++;
                        if (index > data.length-1) index = data.length-1;
                        if (index > ((page+1) * _count)-1) {
                            page++;
                            if (page > pageTotal-1) {page = pageTotal-1;return};
                            _this.doMove("#samllPic",playerWidth,page);
                        }


                        _this.toggle("#screen-block",liCount,data,index);
                    }).on("mouseover",function(){
                        clearTimeout(timer);
                    })
                    .on("mouseout", function () {
                        $(".screen").removeClass("screen-btn-show");
                    });

            });

        },
        toggle : function (dom,obj,data,index) {
            $(dom).html(this.getMediaType(data[index]));
            this.seleced(obj,index);
        },
        doMove : function (obj,playerWidth,page) {
            console.log(page)
            var left = page*playerWidth + ((page+1) * 10);
            $(obj).animate({"left":-(left)});
        }
        ,
        seleced : function (array,index) {
            for (var j = 0; j < array.length; j++) {
                $(array[j+1]).css({"padding-left":10});
                $(array[j]).css("opacity",0.4).attr("index",j);
                $(array[index]).css("opacity",1);
            }
            return array;
        },
        init : function () {
            this.render();
        }
    };



    $.fn.MediaPlayer = function (options) {
        return new MediaPlayer(this,options);
    };
})(window.jQuery);

