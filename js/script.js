import { sendAjax, debounce, checkLoginStatus, hostName, dateTimeToString } from './utils/util.js'; // 为啥 sendAjax 就需要引入呢???

//注册模块
const FormRegister = {
  props: {
    signalChange: Object
  },
  emits: ['signalChange'],  //列出已抛出的事件
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
                  //关闭弹窗
                  document.querySelector('button[data-bs-dismiss="modal"]').click();
                  //点击 登录 按钮
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
        document.querySelector('#password1').setCustomValidity('');
      } else {
        document.querySelector('#password1').setCustomValidity('请确保两次密码一致~');
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
        client.open("GET", 'http://101.42.249.107:5000/api/users/userIsExist?email=' + email);
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
    },
    pathChange(pathname) {
      window.history.pushState(null, null, pathname);
      console.log(`this.signalChange.signal: ${this.signalChange.signal}`)
      this.signalChange.signal = !this.signalChange.signal;
    }
  },
  template: `<form class="needs-validation" novalidate enctype="multipart/form-data" id="resForm" @submit="checkForm($event)">
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
            placeholder="请输入密码~" @input="checkPasswordIsSame($event)" pattern="^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9.@$!%*#?&]{8,16}$" required>
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
                    <a class="btn btn-secondary w-100" @click="pathChange('/login')">登录</a>
                </div>
            </div>
        </div>
    </div>
  </form>`
}

//登录模块
const FormLogin = {
  props: ['signalChange'],
  data() {
    return {
      emailTip: '请检查邮箱格式~',
      emailServerTip: '无此邮箱或邮箱与密码不匹配~',
      passwordTip: '密码为必填项~'
    }
  },
  methods: {
    checkForm(e) {
      if (e.target.checkValidity()) {
        let fd = new FormData(document.querySelector('#logForm'));
        sendAjax('http://101.42.249.107:5000/api/users/login', `email=${encodeURIComponent(fd.get('email'))}&password=${encodeURIComponent(fd.get('password'))}`, 'POST', new Map([['Content-Type', 'application/x-www-form-urlencoded']]))
          .then(response => {
            if (response.code < 0) {
              document.querySelector('#password').classList.add('is-invalid');
              document.querySelector('#password+small').textContent = this.emailServerTip;
            } else {
              document.querySelector('#password').classList.remove('is-invalid');
              document.querySelector('#password+small').textContent = this.emailTip;
              sessionStorage.setItem('token', response.payload.token);
              sessionStorage.setItem('user', JSON.stringify(response.payload.user));
              this.pathChange('/');
            }
          })
          .catch(err => console.log(`err: ${err}`));
      } else {
        e.target.classList.add('was-validated');
      }
    },
    pathChange(pathname) {
      window.history.pushState(null, null, pathname);
      this.signalChange.signal = !this.signalChange.signal;
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
            <a class="btn btn-secondary w-100" @click="pathChange('/register')">注册</a>
          </div>
        </div>
      </div>
    </div>

  </form>`
}

//注册结果回显
const RegisterModal = {
  props: ['signalChange'],
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
}

//登录与注册界面
const LoginOrRegister = {
  props: ['signalChange'],
  created() {
    this.currentPathComponent();

    // this.$watch(
    //   () => this.signalChange.signal,
    //   (newV, oldV) => {
    //     this.pathComponents.length = 0;
    //     this.currentPathComponent();
    //   }
    // );
  },
  data() {
    return {
      visitPaths: ['/login', '/register'],
      pathComponents: []
    }
  },
  methods: {
    currentPathComponent() {
      this.pathComponents.length = 0;
      if ('/login' === location.pathname) {
        this.pathComponents.push('form-login');
      } else if ('/register' === location.pathname) {
        this.pathComponents.push('form-register');
        this.pathComponents.push('register-modal');
      }
    }
  },
  components: {
    'form-login': FormLogin,
    'form-register': FormRegister,
    'register-modal': RegisterModal
  },
  // methods: {}, //这里的 methods 完全覆盖了前面定义的 methods，所以之前methods选项里的所有方法都无法访问
  template: `<div class="d-flex  justify-content-center align-items-center flex-column vh-100">
    <div class="card adaption-width">
      <div class="card-body">
        <h2 class="card-title">资金管理系统</h2>
        <!-- 组件 -->
        <!-- <register-form></register-form> -->
        <!-- <login-form></login-form> -->

        <!-- 动态切换组件 -->
        <component v-for="item of pathComponents" v-bind:is="item" :signal-change="signalChange"></component>
      </div>
    </div>
  </div>`
}

//主界面导航
const FundsNavbar = {
  props: ['signalChange'],
  inject: ['hostName'],
  created() {
    this.user = JSON.parse(sessionStorage.getItem('user'));
  },
  data() {
    return {
      user: null
    }
  },
  methods: {
    imgAuthorization() {

    }
  },
  template: `
    <nav class="navbar navbar-dark bg-secondary">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center" href="#">
          <img src="/img/logo.png" alt="logo" height="40" width="40" class="d-inline-block align-top me-2">
          项目资金管理系统
        </a>

        <div class=" d-flex align-items-center ">
          <div class="dropdown">
            <a class="navbar-brand dropdown-toggle" href="#" id="dropdownMenuButton" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
              <span id="userName">{{ user.name }}</span>
              
            </a>
            <ul class="dropdown-menu dropdown-menu-lg-end" aria-labelledby="dropdownMenuButton">
              <li class="d-flex align-items-center">
                <img src="./img/person.svg" class="ms-2">
                <a class="dropdown-item" href="#">个人信息</a>
              </li>
              <li class="d-flex align-items-center">
                <img src="./img/gear-wide-connected.svg" class="ms-2">
                <a class="dropdown-item" href="#">修改密码</a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li class="d-flex align-items-center">
                <img src="./img/box-arrow-left.svg" class="ms-2">
                <a class="dropdown-item" href="#">退出登录</a>
              </li>
            </ul>
          </div>
          <img :src="hostName + user.avatar" alt="avatar" height="40" width="40" class="d-inline-block align-top rounded-circle ms-2">
        </div>
      </div>
    </nav>
  `
}

//主界面侧边连
const FundsAside = {
  props: ['signalChange'],
  data() {
    return {
      asideItems: new Map([
        ['主页', ''],
        ['资金管理', ''],
        ['个人信息', new Map([
          ['修改密码',''],
          ['信息修改', ''],
          ['个性化设置', '']
        ])]
      ])
    }
  },
  methods: {
    // clickHandler(event) {
    //   let key = event.target.textContent;
    //   console.log(event.target.textContent);
    //   if('个人信息' === key) {
    //     let ul = document.createElement('ul');
    //     ul.classList.add('list-unstyled');
    //     console.log(this.asideItems.get(key));
    //     this.asideItems.get(key).forEach((value, key) => {
    //       let li = document.createElement('li');
    //       li.textContent = JSON.stringify(key);
    //       li.classList.add('ps-5');
    //       li.classList.add('pt-1');
    //       li.classList.add('pb-1');
    //       ul.appendChild(li);
    //     });
    //     event.target.appendChild(ul);
    //   }
      
    // },
    pathChange(pathname) {
      window.history.pushState(null, null, pathname);
      console.log(`this.signalChange.signal: ${this.signalChange.signal}`)
      this.signalChange.signal = !this.signalChange.signal;
    }
  },
  template: `
    <aside class="bg-secondary border-top text-light">
      <ul class="list-unstyled">
        <li class="ps-4 pt-1 pb-1" @click="pathChange('/')">主页</li>
        <li class="ps-4 pt-1 pb-1" @click="pathChange('/manage')">资金管理</li>
        <li class="ps-4 pt-1 pb-1">个人信息</li>
      </ul>
    </aside>
  `
};

//主界面资金管理界面搜索
const FundsSearch = {
  props: ['signalChange'],
  inject: ['profileTypes', 'profiles', 'originProfiles', 'page', 'addAndEditConfig'],
  data() {
    return {
      searchCondition: {
        startDateTime: undefined,
        endDateTime: undefined,
        incodeType: undefined,
        incodeDescribe: undefined
      }
    }
  },
  methods: {
    initPage() {
      this.page.pageCount = Math.ceil(this.profiles.length / this.page.pageEntries);
      this.page.pageIndexStart = 0;
      this.page.pageRealEntries = Math.min(this.profiles.length - this.page.pageIndexStart, this.page.pageEntries);
      this.page.pageIndexEnd = this.page.pageIndexStart + this.page.pageRealEntries;
      this.page.pageCurrent = 1;
    },
    searchHandler() {
      let searchedProfiles = this.originProfiles;
      //筛选条件：起始时间
      if(this.searchCondition.startDateTime) {
        searchedProfiles = searchedProfiles.filter(profile => {
          console.log(`${new Date(profile.create_date)} -- ${new Date(this.searchCondition.startDateTime)} -- ${new Date(profile.create_date) >= new Date(this.searchCondition.startDateTime)}`)
          
          return new Date(profile.create_date) >= new Date(this.searchCondition.startDateTime)
        });
      }
      //筛选条件：结束时间
      if(this.searchCondition.endDateTime) {
        searchedProfiles = searchedProfiles.filter(profile => new Date(profile.create_date) <= new Date(this.searchCondition.startDateTime));
      }
      //筛选条件：收入类型
      if(this.searchCondition.incodeType) {
        searchedProfiles = searchedProfiles.filter(profile => profile.iid === this.searchCondition.incodeType);
      }
      //筛选条件：收入描述
      if(this.searchCondition.incodeDescribe) {
        searchedProfiles = searchedProfiles.filter(profile => profile.incode_describe.includes(this.searchCondition.incodeDescribe));
      }

      this.profiles.length = 0;
      this.profiles.push.apply(this.profiles, searchedProfiles);

      
    },
    search() {
      this.searchCondition.startDateTime = document.querySelector('#startDateTime').value === '' ? '' : document.querySelector('#startDateTime').value + ':00.000Z';
      this.searchCondition.endDateTime = document.querySelector('#endDateTime').value === '' ? '' : document.querySelector('#endDateTime').value + ':00.000Z';
      this.searchCondition.incodeType = +document.querySelector('#incodeType').value;
      this.searchCondition.incodeDescribe = document.querySelector('#incodeDescribe').value;

      this.searchHandler();

      this.initPage();
    },
    addProfile() {
      this.addAndEditConfig.modalTitle = '添加项目资金信息',
      this.addAndEditConfig.primaryBtnName = '添加',
      this.addAndEditConfig.secondaryBtnName = '关闭'
    }
  },
  template: `
  <form class="row gy-2 gx-3 align-items-center mt-2 mb-3 position-relative" @submit.stop.prevent="search">
    <div class="col-auto d-flex flex-row justify-content-center align-items-center">
      <input type="datetime-local" class="form-control" id="startDateTime" placeholder="Jane Doe">
      &nbsp;&nbsp;TO&nbsp;&nbsp;
      <input type="datetime-local" class="form-control" id="endDateTime" placeholder="Jane Doe">
    </div>
    <div class="col-auto">
      <select class="form-select" id="incodeType">
        <option selected disabled>请选择收支类型</option>
        <option v-for="key in profileTypes.keys()" :value="key">{{ profileTypes.get(key) }}</option>
      </select>
    </div>
    <div class="col-auto">
      <div class="input-group">
        <input type="text" class="form-control" id="incodeDescribe" placeholder="收支描述">
      </div>
    </div>
    <div class="col-auto">
      <button type="submit" class="btn btn-primary ps-5 pe-5">搜索</button>
    </div>
    <div class="col-auto position-absolute top-0" style="right: 7%;">
      <button type="button" class="btn btn-success ps-5 pe-5" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="addProfile">添加</button>
    </div>
  </form>
  `
}

//添加和修改面板
const FundsAE = {
  inject: ['hostName', 'addAndEditConfig'],
  data() {
    return {
    }
  },
  methods: {
    sumbitHandler() {
      
      const AE = document.querySelector('#ae');
      if(AE.reportValidity()) {
        let profile = {};
        profile.iid = document.querySelector('#iid').value;
        profile.incode_describe = document.querySelector('#incode_describe').value;
        profile.incode = document.querySelector('#incode').value;
        profile.expend = document.querySelector('#expend').value;
        profile.cash = document.querySelector('#cash').value;
        profile.remark = document.querySelector('#remark').value;
        profile

        sendAjax(`${this.hostName}/api/profiles/profile`, JSON.stringify(profile), 'POST', new Map([['Authorization', sessionStorage.getItem('token')], ['Content-Type', 'application/json']]))
          .then(response => {
            if(response.id < 0) {
              alert('添加失败，请联系管理员~');
            }else {
              document.querySelector('#close').click();
            }
          })
          .catch(err => console.error(err));
      }
    }
  },
  template: `
  <!-- Modal -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ addAndEditConfig.modalTitle }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="ae">
            <div class="mb-3">
              <label for="formGroupExampleInput" class="form-label">收支类型</label>
              <select id="iid" class="form-select" aria-label="Default select example" required>
                <option selected disable value="">请选择收支类型</option>
                <option value="1">促销</option>
                <option value="2">线上</option>
                <option value="3">线下</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="incode_describe" class="form-label">收支描述</label>
              <textarea class="form-control" id="incode_describe" rows="3" placeholder="请输入收入描述~"></textarea>
            </div>
            <div class="mb-3">
              <label for="incode" class="form-label">收入</label>
              <input type="number" class="form-control" id="incode" required placeholder="请输入收入金额~">
            </div>
            <div class="mb-3">
              <label for="expend" class="form-label">支出</label>
              <input type="number" class="form-control" id="expend" required placeholder="请输入支出金额~">
            </div>
            <div class="mb-3">
              <label for="cash" class="form-label">账户现金</label>
              <input type="number" class="form-control" id="cash" required placeholder="请输入账户现金~">
            </div>
            <div class="mb-3">
              <label for="remark" class="form-label">备注</label>
              <textarea class="form-control" id="remark" rows="3" placeholder="要备注点什么呢~"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button id="close" type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ addAndEditConfig.secondaryBtnName }}</button>
          <button type="button" class="btn btn-primary" @click.stop.prevent="sumbitHandler">{{ addAndEditConfig.primaryBtnName }}</button>
        </div>
      </div>
    </div>
  </div>`
}

//主界面资金管理界面表格显示
const FundsShow = {
  props: ['signalChange'],
  inject: ['hostName', 'profileTypes', 'profiles', 'page', 'originProfiles', 'addAndEditConfig'],
  data() {
    return {
      sortByTime: this.sortStatus(),
      sortByType: this.sortStatus(),
      sortByIncode: this.sortStatus(),
      sortByExpend: this.sortStatus(),
      sortByCash: this.sortStatus(),
      rainbow: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'],   //排序优先级
      sortFieldMap: new Map(),  //颜色排布，Set、Map可以按照插入的顺序迭代它的元素
    }
  },
  methods: {
    pathChange(pathname) {
      window.history.pushState(null, null, pathname);
      this.signalChange.signal = !this.signalChange.signal;
    },
    profilePropShow(key, value) {
      if('create_date' === key) {
        return value.slice(0,19).replace('T',' ');
      }else if('iid' === key) {
        return this.profileTypes.get(value);
      }else {
        if(('incode_describe' === key || 'remark' === key) && value.length > 4) {
          return value.slice(0, 4) + '...';
        }
        return value;
      }
    },
    * sortStatus() {
      while(true) {
        console.log('屌大的排前面');
        yield 'positive';   //正排状态
        console.log('屌小的排前面');
        yield 'reverse';    //反排状态
        console.log('穿着裤衩呢~');
        yield 'nosort'
      }
    },
    sortHandler() {
      //每次计算应该从原始的顺序开始计算
      this.profiles.length = 0;
      this.profiles.push.apply(this.profiles, this.originProfiles);
      

      this.profiles.sort((firstEl, secondEl) => { //compareFunction(a, b)小于 0 ，那么 a 会被排列到 b 之前
        const iterator1 = this.sortFieldMap.values();
        for(let i=0; i<this.sortFieldMap.size; i++) {
          let sortConditions = iterator1.next().value.split(':');
          if(firstEl[sortConditions[0]] === secondEl[sortConditions[0]]) {
            continue;
          }else { //前面的条件肯定都相等了
            if('positive' === sortConditions[1]) {  //正排，大的在前
              if('create_date' === sortConditions[0]) {
                return -(new Date(firstEl[sortConditions[0]]) - new Date(secondEl[sortConditions[0]]));
              }else {
               return -(firstEl[sortConditions[0]] - secondEl[sortConditions[0]]);
              }
            }else if('reverse' === sortConditions[1]) { //反排，小的在后
              if('create_date' === sortConditions[0]) {
                return new Date(firstEl[sortConditions[0]]) - new Date(secondEl[sortConditions[0]]);
              }else{
                return firstEl[sortConditions[0]] - secondEl[sortConditions[0]];
              }
            }
          }
          
        }

      });
    },
    sortData(sortGen, field, event) { //使用  localStorage  存储排序的条件
      //可能在 th 元素触发，也可能在 i 元素触发，确保 el 指向 th 元素
      let el = 'I' === event.target.tagName ? event.target.parentNode : event.target;   
      console.log(event.target.tagName);
      
      //先检查是否是第一次点击排序，如果是的就要添加 i 元素
      let sortI = el.querySelector('i');
      

      if(!sortI) {
        sortI = event.target.appendChild(document.createElement('i'));
        sortI.classList.add('bi');
      }

      switch (sortGen.next().value) {
        case 'positive':  //正排，大的在前
          //确保 sortFieldList 可以正确反应排序的字段的顺序 - 添加
          this.sortFieldMap.set(sortI, `${field}:positive`);

          // sortI.style = 'color: red;';
          sortI.classList.add('bi-caret-down-fill');
            
          break;

        case 'reverse': //反排，小的在后
          this.sortFieldMap.set(sortI, `${field}:reverse`);
          // sortI.style = 'color: orange;';
          sortI.classList.remove('bi-caret-down-fill');
          sortI.classList.add('bi-caret-up-fill');
            
            break;

        case 'nosort':  //没有排序
          //确保 sortFieldList 可以正确反应排序的字段的顺序 - 删除
          this.sortFieldMap.delete(sortI);

          sortI.classList.remove('bi-caret-up-fill');
          sortI.style = '';
        default:
          break;
      }

      //排序着色
      const iterator1 = this.sortFieldMap.keys();
      for(let i=0; i<this.sortFieldMap.size; i++) {
        iterator1.next().value.style = `color: ${this.rainbow[i]}`;
      }
      this.sortHandler();
      this.initPage();

      //防止反复处理
      event.stopPropagation();
    },
    initPage() {
      this.page.pageCount = Math.ceil(this.profiles.length / this.page.pageEntries);
      this.page.pageIndexStart = 0;
      this.page.pageRealEntries = Math.min(this.profiles.length - this.page.pageIndexStart, this.page.pageEntries);
      this.page.pageIndexEnd = this.page.pageIndexStart + this.page.pageRealEntries;
      this.page.pageCurrent = 1;
    },
    editProfile() {
      this.addAndEditConfig.modalTitle = '编辑项目资金信息';
      this.addAndEditConfig.primaryBtnName = '保存';
      this.addAndEditConfig.secondaryBtnName = '关闭';
    }
  },
  template: `
  <table class="table table-striped text-center" v-if="this.profiles.length > 0">
    <thead>
      <tr>
        <th scope="col" @click="sortData(sortByTime, 'create_date', $event)">创建时间</th>
        <th scope="col" @click="sortData(sortByType, 'iid', $event)">收支类型</th>
        <th scope="col">收支描述</th>
        <th scope="col" @click="sortData(sortByIncode, 'incode', $event)">收入</th>
        <th scope="col" @click="sortData(sortByExpend, 'expend', $event)">支出</th>
        <th scope="col" @click="sortData(sortByCash, 'cash', $event)">账户现金</th>
        <th scope="col">备注</th>
        <th scope="col">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="index of page.pageRealEntries">
        <template v-for="(value, key) in profiles[page.pageIndexStart + index - 1]" :key="value.pid">
          <td v-if="key !== 'pid'">{{ profilePropShow(key, value) }}</td>
        </template>
        <td colspan="2">
          <button class="btn btn-warning me-2 ps-3 pe-3" @click="editProfile" data-bs-toggle="modal" data-bs-target="#exampleModal">编辑</button>
          <button class="btn btn-danger ms-2 ps-3 pe-3">删除</button>
        </td>
      </tr>
    </tbody>
  </table>
  `
}

//分页组件，传入总条数，传出起始条数和结束条数
const FundsPagination = {
  inject: ['profiles','page'],
  methods: {
    changePageCurrent(e) {  //显示第几页
      // console.log(e.target);
      this.page.pageCurrent = +e.target.textContent;
      this.page.pageIndexStart = (this.page.pageCurrent - 1) * this.page.pageEntries;
      this.page.pageRealEntries = Math.min(this.profiles.length - this.page.pageIndexStart, this.page.pageEntries);
      this.page.pageIndexEnd = this.page.pageCurrent * this.page.pageRealEntries;
    },
    forwardPageIndex() {  //前一页
      this.page.pageCurrent += 1;
      this.page.pageIndexStart = (this.page.pageCurrent - 1) * this.page.pageEntries;
      this.page.pageRealEntries = Math.min(this.profiles.length - this.page.pageIndexStart, this.page.pageEntries);
      this.page.pageIndexEnd = this.page.pageCurrent * this.page.pageRealEntries;
    },
    backPageIndex() { //后一页
      this.page.pageCurrent -= 1;
      this.page.pageIndexStart = (this.page.pageCurrent - 1) * this.page.pageEntries;
      this.page.pageRealEntries = Math.min(this.profiles.length - this.page.pageIndexStart, this.page.pageEntries);
      this.page.pageIndexEnd = this.page.pageCurrent * this.page.pageRealEntries;
    },
    changePageEntries(e) {  //页面改变后，显示第一页
      console.log(+e.target.value);
      this.page.pageEntries = +e.target.value;
      this.page.pageCount = Math.ceil(this.profiles.length / this.page.pageEntries);
      this.page.pageCurrent = 1;
      this.page.pageIndexStart = 0;
      this.page.pageIndexEnd = Math.min(this.page.pageIndexStart + this.page.pageEntries, this.profiles.length);
      this.page.pageRealEntries = this.page.pageIndexEnd - this.page.pageIndexStart;
    }
  },
  template: `
  <div class="row m-3">
    <div class="col-5 d-flex align-items-center ps-4">
      <p class="m-0 pe-2">共{{ profiles.length }}条记录</p>
      <select class="form-select-sm  w-auto" aria-label="Default select example" @change="changePageEntries">
        <option v-for="entries in page.pageEntriesList" :value="entries" :selected="entries===page.pageEntries">
          {{ entries }}条/每页
        </option>
        
      </select>
    </div>
    <div class="col-7">
      <nav aria-label="Page navigation example">
        <ul v-if="profiles.length > 0" class="pagination justify-content-end m-0">
          <li class="page-item" :class="1 === page.pageCurrent ? 'disabled' : ''">
            <a class="page-link" href="#" aria-label="Previous"  @click.stop.prevent="backPageIndex">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li v-for="index in page.pageCount" class="page-item" :class="page.pageCurrent===index ? 'active' : ''">
            <a class="page-link" href="#" @click.stop.prevent="changePageCurrent($event)">{{ index }}</a>
          </li>
          <li class="page-item" :class="page.pageCurrent === page.pageCount ? 'disabled' : ''">
            <a class="page-link" href="#" aria-label="Next" @click.stop.prevent="forwardPageIndex">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
  </div>
  `
}

const FundsIndex = {
  template: `<h1>项目资金管理系统</h1>`
}

//主界面资金管理界面
const FundsManage = {
  props: ['signalChange'],
  inject: ['hostName'],
  created() {
    this.currentPathComponent();
    this.getProfileTypes();
    this.getProfiles();
  },
  data() {
    return {
      pathComponents: [],
      profileTypes: new Map(),
      profiles: [], //项目资金数据
      page: {
        pageCount: undefined, //页码数
        pageEntries: 10,  //页面中的条数
        pageEntriesList: [5, 10, 20, 30, 50], //页面中的条数
        pageRealEntries: 10,
        pageIndexStart: 0,  //页面起始数据
        pageIndexEnd: 10,  //页面结束数据
        pageCurrent: 1, //当前的页面数
        
      },
      originProfiles: [],
      addAndEditConfig: {
        modalTitle: '添加项目资金信息',
        primaryBtnName: '添加',
        secondaryBtnName: '取消'
      }
    }
  },
  provide() {
    return {
      // types: Vue.computed(() => this.profileTypes)
      profileTypes: this.profileTypes,
      profiles: this.profiles,
      page: this.page,
      originProfiles: this.originProfiles,
      addAndEditConfig: this.addAndEditConfig
    }
  },
  methods: {
    currentPathComponent() {
      this.pathComponents.length = 0;
      if (['/home','/'].includes(location.pathname)) {  //主页
        this.pathComponents.push('funds-index');
      } else if ('/manage' === location.pathname) { //资金管理
        this.pathComponents.push('funds-search');
        this.pathComponents.push('funds-show');
        this.pathComponents.push('funds-pagination');
        this.pathComponents.push('funds-a-e');
      }
    },
    pathChange(pathname) {
      window.history.pushState(null, null, pathname);
      this.signalChange.signal = !this.signalChange.signal;
    },
    getProfileTypes() {
      sendAjax(`${this.hostName}/api/profiles/type`, null, 'GET', new Map([['Authorization', sessionStorage.getItem('token')]]))
        .then(response => {
          response.payload.forEach(type => {
            this.profileTypes.set(type.iid, type.incode_type_name);
          });
        })
        .catch(err => {
          if('number' === typeof err) {
            this.pathChange('/login');
          }else {
            console.log(err);
          }
        });
    },
    getProfiles() {
      sendAjax(`${hostName}/api/profiles/profile`, undefined, 'GET', new Map([['Authorization', sessionStorage.getItem('token')]]))
        .then(response => {
          this.profiles.length = 0;
          response.payload.forEach(profile => {
            this.profiles.push(profile);
          });
          this.setPage();
          this.originProfiles.push.apply(this.originProfiles, this.profiles);
        })
        .catch(err => {
          if(401 === err) {
            this.pathChange('/login');
          }
        });
    },
    setPage() {
      this.page.pageCount = Math.ceil(this.profiles.length / this.page.pageEntries);
      this.page.pageRealEntries = Math.min(this.profiles.length, this.page.pageEntries);
    }
  },
  components: {
    'funds-search': FundsSearch,
    'funds-show': FundsShow,
    'funds-pagination': FundsPagination,
    'funds-a-e': FundsAE,
    'funds-index': FundsIndex
  },
  template: `
    <main class="container-fluid">  
      <component v-for="item of pathComponents" v-bind:is="item" :signal-change="signalChange"></component>
    </main>
  `
};


//主界面侧边栏与主线区域
const FundsContent = {
  props: ['signalChange'],
  created() {
    this.currentPathComponent();
  },
  data() {
    return {
      pathComponents: []
    }
  },
  methods: {
    currentPathComponent() {
      this.pathComponents.length = 0;
      if (['/home'].includes(location.pathname)) {  //主页
        this.pathComponents.push('');
      } else if (['/manage', '/'].includes(location.pathname)) { //资金管理
        this.pathComponents.push('funds-aside');
        this.pathComponents.push('funds-manage');
      }
    }
  },
  components: {
    'funds-aside': FundsAside,
    'funds-manage': FundsManage
  },
  template: `
    <div class="container-fluid d-flex p-0" :signal-change="signalChange">
      <component v-for="item of pathComponents" :is="item" :signal-change="signalChange"></component>
    </div>
  `
};

const app = Vue.createApp({ //为啥 Vue 不用引入呢???
  created() {
    //响应路由更改，含登录检测
    this.$watch(
      () => this.signalChange.signal,
      (newV, oldV) => {
        this.urlComponents.length = 0;
        if (!checkLoginStatus()) {  //视为未登录，转到登陆界面
          console.log('async await')
          window.history.pushState(null, null, '/login');
        }
        this.pathDetermineComponents();
      }
    );

    //响应历史记录
    window.addEventListener('popstate', () => {
      console.log('popstate');
      this.pathDetermineComponents();
    });

    //含登录检测
    if (checkLoginStatus()) {  //视为已登录，不做拦截
      this.pathDetermineComponents();
    } else {  //视为未登录，转到登陆界面
      window.history.pushState(null, null, '/login');
      this.signalChange = !this.signalChange;
    }
  },
  data() {
    return {
      visitPaths: ['/', '/login', '/register'],
      urlComponents: [],
      signalChange: {
        signal: false
      },
      hostName: 'http://101.42.249.107:5000'
    }
  },
  provide() {
    return {
      hostName: this.hostName
    }
  },
  methods: {
    pathDetermineComponents() {
      this.urlComponents.length = 0;
      if (['/login', '/register'].includes(location.pathname)) {
        this.urlComponents.push('login-or-register');
      } else if (['/manage', '/'].includes(location.pathname)) {
        this.urlComponents.push('funds-navbar');
        this.urlComponents.push('funds-content');
      }
    }
  },
  components: {
    'login-or-register': LoginOrRegister,
    'funds-navbar': FundsNavbar,
    'funds-content': FundsContent
  }
});


app.mount('#app-container');



