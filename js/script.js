import { sendAjax } from './utils/util.js';

const app = Vue.createApp({
  data() {
    return {
      currentTab: 'login'
    }
  },
  computed: {
    currentComponent() {
      return `form-${this.currentTab}`;
    }
  }
});

app.component('form-register', {
  emits: ['toggleForm'],  //
  data() {
    return {
      nameTip: '姓名的长度大于2小于16~',
      passwordTip: '密码长度应该是 8 至 16 位的，并且应该包含一个大、小写字母~',
      password1Tip: '两次密码不一致~',
      emailTip: '请检查邮箱格式~',
      emailIsExistTip: '此邮箱被注册，请更换其他邮箱~',
      avatarTip: '请选择用户角色~',
      regResSucTipPre: '注册成功，',
      regResSucTipSuf: '秒后即将跳转到登录界面~',
      regResFaiTip: '注册失败，请联系管理员~'
    }
  },
  methods: {
    checkForm(event) {
      const password = document.querySelector('#password');
      const password1 = document.querySelector('#password1');
      if (password.value !== password1.value) {
        password1.setCustomValidity('两次密码不一致~');

      }

      if (!event.target.checkValidity()) {
        event.preventDefault()
        event.stopPropagation(event.name)
      } else {
        event.preventDefault();
        event.stopPropagation(event.name);
        const fd = new FormData(document.querySelector('#resForm'));
        sendAjax("http://101.42.249.107:5000/api/users/user", fd, 'POST')
          .then(response => {
            const modalBody = document.querySelector('.modal-body');
            if (response.code === 1) {
              let timeCount = 3;
              modalBody.innerText = `${this.regResSucTipPre}${timeCount}${this.regResSucTipSuf}`
              let intervalNum = setInterval(() => {
                if (0 === --timeCount) {
                  clearInterval(intervalNum);
                  document.querySelector('button[data-bs-dismiss="modal"]').click();
                  document.querySelector('a[class~="btn"]').click();
                }
                modalBody.innerText = `${this.regResSucTipPre}${timeCount}${this.regResSucTipSuf}`;
              }, 1000);
            } else {
              modalBody.textContent = this.regResFaiTip;
            }
            document.querySelector('#regRes').click();
          })
          .catch(err => console.log(err));
      }
      event.target.classList.add('was-validated')
    },
    sendData() {
      let xhr = new XMLHttpRequest();
      let fd = new FormData(document.querySelector('#resForm'));

      xhr.onload = res => {
        console.log(res);
      }

      xhr.open("POST", "http://101.42.249.107:5000/api/users/user");
      xhr.send(fd);
    },
    checkPasswordIsSame(e) {
      if (document.querySelector('#password').value === e.target.value) {
        e.target.setCustomValidity('');
      } else {
        e.target.setCustomValidity('请确保两次密码一致~');
      }
    },
    checkEmailIsRegister(email = '') {
      function operate(resolve, reject) {
        const handler = function () {
          if (this.readyState !== 4) {
            return;
          }
          if (this.status === 200) {
            resolve(this.response);
          } else {
            console.log(`statusText: ${this.statusText}`);
            reject(new Error(this.statusText));
          }
        };

        const client = new XMLHttpRequest();
        client.open("GET", 'http://101.42.249.107:5000/api/users/user?email=' + email);
        client.onreadystatechange = handler;
        client.onerror = e => console.log(`onerror: ${JSON.stringify(e)}`);
        client.responseType = "json";
        client.setRequestHeader("Accept", "applicatioin/json");
        client.send();
      }

      const promise = new Promise(operate);

      return promise;
    },
    checkEmailIsExist: debounce(function (e) {
      const emailTipSmall = document.querySelector('#email+small');
      e.target.setCustomValidity(''); //防止上次检测的结果影响此次检测
      if (!e.target.checkValidity()) { //先检查输入是否合法
        e.target.classList.remove('is-valid');
        e.target.classList.add('is-invalid');
        emailTipSmall.textContent = this.emailTip;
      } else {
        this.checkEmailIsRegister(e.target.value)
          .then(response => {
            if (response.code === 1) { //此邮箱可以使用
              e.target.classList.remove('is-invalid');
              e.target.classList.add('is-valid');
              e.target.setCustomValidity('');
            } else { //此邮箱已被注册
              e.target.classList.remove('is-valid');
              e.target.classList.add('is-invalid');
              e.target.setCustomValidity(this.emailIsExistTip);
              emailTipSmall.textContent = this.emailIsExistTip;
            }
          })
          .catch(reason => {
            console.log(`reason => ${reason}`);
          });
      }
    }, 800),
    avatarSelect() {
      document.querySelector('#avatar').click();
    },
    avatarChange() {
      const fileInput = document.querySelector('#avatar');
      const fileDiv = document.querySelector('#avatarShow');

      for (let file of fileInput.files) {
        if (!/^image\//.test(file.type)) {
          alert('头像应该为图片格式~');
          continue;
        }
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = function () {
          fileDiv.innerHTML = '';
          fileDiv.appendChild(img);
          const span = document.createElement('span');
          span.addEventListener('click', e => {
            e.stopPropagation();
            fileDiv.innerHTML = '';
            fileInput.value = null;
            const img = new Image();
            img.src = './img/plus-lg.svg';
            img.classList.add('avatar-tip');
            img.onload = () => fileDiv.appendChild(img);
          });
          fileDiv.appendChild(span);
          URL.revokeObjectURL(this.src);
        }
      }
    }


  },
  template: `<form class="needs-validation" novalidate enctype="multipart/form-data" id="resForm"
    @submit="checkForm($event)">
    <div class="mb-3 ">
      <label for="avatar" class="form-label mb-1">头像</label>
      <div class="form-control border-0 d-flex justify-content-center">
        <input type="file" class="d-none" name="avatar" id="avatar" @change="avatarChange">
        <div class="rounded-circle" id="avatarShow" @click="avatarSelect">
          <img src="./img/plus-lg.svg" class="avatar-tip" />
        </div>
      </div>
    </div>
    <div class="mb-3">
      <label for="name" class="form-label mb-1">姓名</label>
      <input type="text" class="form-control" id="name" name="name" autocomplete="off" placeholder="请输入真实姓名~"
        pattern="[^]{2,16}" required>
      <small class="invalid-feedback">
        {{ nameTip }}
      </small>
    </div>
    <div class="mb-3">
      <label for="password" class="form-label mb-1">密码</label>
      <input type="password" class="form-control" id="password" name="password" autocomplete="off"
        placeholder="请输入密码~" pattern="^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9.@$!%*#?&]{8,16}$" required>
      <small class="invalid-feedback">
        {{ passwordTip }}
      </small>
    </div>
    <div class="mb-3">
      <label for="password1" class="form-label mb-1">确认密码</label>
      <input type="password" class="form-control" id="password1" placeholder="请再次输入密码~"
        @input="checkPasswordIsSame($event)" autocomplete="off" required>
      <small class="invalid-feedback">
        {{ password1Tip }}
      </small>
    </div>
    <div class="mb-3">
      <label for="email" class="form-label mb-1">邮箱</label>
      <input type="email" class="form-control" id="email" name="email" pattern="^.+@.+\\..+$"
        @input="checkEmailIsExist" autocomplete="off" placeholder="请输入邮箱~" required>
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
      <small class="invalid-feedback">
        {{ avatarTip }}
      </small>
    </div>
    <div class="mb-3">
      <div class="row  g-0">
        <div class="col">
          <div class="pe-1">
            <button type="submit" class="btn btn-primary w-100">注册</button>
          </div>
        </div>
        <div class="col">
          <div class="ps-1">
            <a class="btn btn-secondary w-100" @click="$emit('toggleForm', 'login')">登录</a>
          </div>
        </div>
      </div>
    </div>
  </form>`
});

app.component('form-login', {
  emits: ['toggleForm'],
  data() {
    return {
      emailTip: '请检查邮箱格式~',
      passwordTip: '密码为必填项~'
    }
  },
  methods: {
    checkForm(e) {
      if (e.target.checkValidity()) {
        let fd = new FormData(document.querySelector('#logForm'));
        sendAjax('http://101.42.249.107:5000/api/users/login', `email=${encodeURIComponent(fd.get('email'))}&password=${encodeURIComponent(fd.get('password'))}`, 'POST', true)
          .then(response => {
            console.log(response);
          })
          .catch(err => console.log(`err: ${err}`));
      } else {
        e.target.classList.add('was-validated');
      }
    }
  },
  template: `<form class="needs-validation" novalidate id="logForm" @submit.prevent.stop="checkForm($event)">       
    <div class="mb-3">
      <label for="email" class="form-label mb-1">邮箱</label>
      <input type="email" class="form-control" id="email" name="email" pattern="^.+@.+\\..+$"
        placeholder="请输入邮箱~" required>
      <small class="invalid-feedback">
        {{ emailTip }}
      </small>
    </div>
    
    <div class="mb-3">
      <label for="password" class="form-label mb-1">密码</label>
      <input type="password" class="form-control" id="password" name="password" autocomplete="off"
        placeholder="请输入密码~" required>
      <small class="invalid-feedback">
        {{ passwordTip }}
      </small>
    </div>

    <div class="mb-3">
      <div class="row  g-0">
        <div class="col">
          <div class="pe-1">
            <button type="submit" class="btn btn-primary w-100">登录</button>
          </div>
        </div>
        <div class="col">
          <div class="ps-1">
            <a class="btn btn-secondary w-100" @click="$emit('toggleForm', 'register')">注册</a>
          </div>
        </div>
      </div>
    </div>

  </form>`
});

app.component('reg-modal', {
  template: `<!-- Button trigger modal -->
  <button id="regRes" type="button" class="btn btn-primary d-none" data-bs-toggle="modal"
    data-bs-target="#staticBackdrop">
    注册结果回显
  </button>

  <!-- Modal -->
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          等待结果~
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">留在此页</button>
          <button type="button" class="btn btn-primary">前往登录界面</button>
        </div>
      </div>
    </div>
  </div>`
});


app.mount('#app-container');

function debounce(func, wait) {
  let timeout;

  return function () {
    let context = this; //保存 this 指向
    let args = arguments; //拿到 event 对象

    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  }
}

