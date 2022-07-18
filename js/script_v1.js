const app = Vue.createApp({});

Vue.component('registerForm', {
    data() {
        return {
            nameTip: '姓名的长度大于2小于16~',
            passwordTip: '密码长度应该是 8 至 16 位的，并且应该包含一个大、小写字母~',
            password1Tip: '两次密码不一致~',
            emailTip: '请检查邮箱格式~',
            avatarTip: '请选择用户角色~'
        }
    },
    template: ` <form class="needs-validation" novalidate enctype="multipart/form-data" id="resForm">
    <div class="mb-3">
      <label for="name" class="form-label mb-1">姓名</label>
      <input type="text" class="form-control" id="name" name="name" placeholder="请输入真实姓名~" pattern="[^]{2,16}"
        required>
      <small class="invalid-feedback">
        {{ nameTip }}
      </small>
    </div>
    <div class="mb-3">
      <label for="password" class="form-label mb-1">密码</label>
      <input type="password" class="form-control" id="password" name="password" placeholder="请输入密码~"
        pattern="^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9.@$!%*#?&]{8,16}$" required>
      <small class="invalid-feedback">
        {{ passwordTip }}
      </small>
    </div>
    <div class="mb-3">
      <label for="password1" class="form-label mb-1">确认密码</label>
      <input type="password" class="form-control" id="password1" placeholder="请再次输入密码~" required>
      <div class="invalid-feedback">
        {{ password1Tip }}
        </di>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label mb-1">邮箱</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="请输入邮箱~" required>
        <small class="invalid-feedback">
          {{ emailTip }}
        </small>
      </div>
      <div class="mb-3">
        <label for="rid" class="form-label mb1">用户角色</label>
        <select class="form-select" id="rid" name="rid" required>
          <option selected disabled value="">请选择身份</option>
          <option value="100">管理员</option>
          <option value="200">员工</option>
        </select>
        <div class="invalid-feedback">
          {{ avatarTip }}
        </div>
      </div>

      <div class="mb-3">
        <label for="avatar" class="form-label mb-1">头像</label>
        <input type="file" class="form-control" id="avatar" name="avatar" placeholder="请上传头像~">
      </div>

      <div class="mb-3">
        <div class="row  g-0">
          <div class="col">
            <div class="pe-1">
              <button type="submit" class="btn btn-primary form-control">注册</button>
            </div>
          </div>
          <div class="col">
            <div class="ps-1">
              <button type="submit" class="btn btn-secondary form-control">登录</button>
            </div>
          </div>
        </div>
      </div>

  </form>`
});