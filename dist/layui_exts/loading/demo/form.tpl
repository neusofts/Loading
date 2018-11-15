<style>
    .form-div {
        padding-top: 30px;
        padding-right: 40px;
    }
</style>

<div class="form-div">
    <form class="layui-form" id="layer-form" onsubmit="return false">
        <div class="layui-form-item">
            <label class="layui-form-label">{{d.user.title}}</label>
            <div class="layui-input-block">
                <input type="text" name="user" lay-verify="user" value="{{d.user.value}}" maxlength="20" placeholder="{{d.user.placeholder}}" autocomplete="off" class="layui-input">
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label">{{d.pw.title}}</label>
            <div class="layui-input-inline">
                <input type="password" name="pw" lay-verify="pw" value="{{d.pw.value}}" maxlength="20" placeholder="{{d.pw.placeholder}}" autocomplete="off" class="layui-input">
            </div>
            <div class="layui-form-mid layui-word-aux">{{d.pw.info}}</div>
        </div>
        <div class="layui-form-item layui-hide">
            <div class="layui-input-block">
                <button class="layui-btn" lay-filter="login" lay-submit="">{{d.btn.submit}}</button>
                <button class="layui-btn layui-btn-primary" type="reset">{{d.btn.reset}}</button>
            </div>
        </div>
    </form>
</div>