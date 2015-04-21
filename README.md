# jquery-media
a multiMediaPlayer of jquery<br>
demo : http://zedwang.github.io/jquery-media/
# example

<pre>
    <code>
        new MediaPlayer({
            flip : true,   //是否禁止缩略图翻页，默认为false
             data : function(callback){
                 $.get("xx.com/api",function(data){
                     callback(data)//一定要放数组
                 })
             }
        })
    </code>
</pre>

