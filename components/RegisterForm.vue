<script>
export default {
    data() {
        return {
            nameTip: '姓名的长度大于2小于16~',
            passwordTip: '密码长度应该是 8 至 16 位的，并且应该包含一个大、小写字母~',
            password1Tip: '两次密码不一致~',
            emailTip: '请检查邮箱格式~',
            emailIsExistTip: '此邮箱被注册，请更换其他邮箱~',
            avatarTip: '请选择用户角色~'
        }
    },
    methods: {
        checkForm(event) {
            const password = document.querySelector('#password');
            const password1 = document.querySelector('#password1');
            console.log(`${password.value} ${password1.value}`);
            if (password.value !== password1.value) {
                password1.setCustomValidity('请确保两次密码不一致~');

            }
            if (!event.target.checkValidity()) {
                event.preventDefault()
                event.stopPropagation(event.name)
            } else {
                event.preventDefault();
                event.stopPropagation(event.name);

                this.sendData();
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
            const promise = new Promise((resolve, reject) => {
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
            });

            return promise;
        },
        checkEmailIsExist(e) {
            const emailTipSmall = document.querySelector('#email+small');
            console.log(`res: ${e.target.checkValidity()}`);
            if (!e.target.checkValidity()) { //先检查输入是否合法
                e.target.classList.remove('invalid-feedback');
                e.target.classList.remove('is-valid');
                e.target.classList.add('is-invalid');
                emailTipSmall.textContent = this.emailTip;
            } else {
                this.checkEmailIsRegister(e.target.value)
                    .then(response => {
                        console.log(response);
                        const originTip = emailTipSmall.textContent;
                        if (response.code === 1) { //此邮箱可以使用
                            e.target.classList.remove('invalid-feedback');
                            e.target.classList.remove('is-invalid');
                            e.target.classList.add('is-valid');
                            emailTipSmall.textContent = originTip;
                        } else { //此邮箱已被注册
                            e.target.classList.remove('invalid-feedback');
                            e.target.classList.remove('is-valid');
                            e.target.classList.add('is-invalid');
                            emailTipSmall.textContent = this.emailIsExistTip;
                        }
                    })
                    .catch(reason => {
                        console.log(`reason => ${reason}`);
                    });
            }
        }
    }
}
</script>

<template>
    <form class="needs-validation" novalidate enctype="multipart/form-data" id="resForm" @submit="checkForm($event)">
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
            <input type="email" class="form-control" id="email" name="email" @input="checkEmailIsExist($event)"
                autocomplete="off" placeholder="请输入邮箱~" required>
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
            <label for="avatar" class="form-label mb-1">头像</label>
            <input type="file" class="form-control" id="avatar" name="avatar" placeholder="请上传头像~">
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
                        <button type="submit" class="btn btn-secondary w-100">登录</button>
                    </div>
                </div>
            </div>
        </div>

    </form>
</template>