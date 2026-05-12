// auth.js - Giriş, Kayıt ve Çıkış işlemleri
// Kullanıcılar için JSON dizisi, oturum için localStorage kullanır

// Varsayılan kullanıcı listesi
var users = [
  { id: 1, username: "admin", password: "1234"    },
  { id: 2, username: "ali",   password: "ali123"  },
  { id: 3, username: "ayse",  password: "ayse123" }
];

// Kayıtlı kullanıcıları localStorage'dan yükle ve birleştir
function loadAllUsers() {
  var saved = localStorage.getItem("driveEaseUsers");
  if (saved) {
    var parsed = JSON.parse(saved);
    // Varsayılan listede olmayan kullanıcıları ekle
    for (var i = 0; i < parsed.length; i++) {
      var found = false;
      for (var j = 0; j < users.length; j++) {
        if (users[j].username === parsed[i].username) {
          found = true;
          break;
        }
      }
      if (!found) {
        users.push(parsed[i]);
      }
    }
  }
  return users;
}

// Kullanıcı dizisini localStorage'a kaydet (yalnızca kayıtlılar, varsayılanlar hariç)
function saveUsers(allUsers) {
  // İlk 3 varsayılan kullanıcı hariç herkesi kaydet
  var registered = [];
  for (var i = 3; i < allUsers.length; i++) {
    registered.push(allUsers[i]);
  }
  localStorage.setItem("driveEaseUsers", JSON.stringify(registered));
}

// Giriş kontrolü - kullanıcı nesnesi veya null döner
function loginUser(username, password) {
  var allUsers = loadAllUsers();
  for (var i = 0; i < allUsers.length; i++) {
    if (allUsers[i].username === username && allUsers[i].password === password) {
      return allUsers[i];
    }
  }
  return null;
}

// Yeni kullanıcı kaydı - başarılıysa true, kullanıcı adı alınmışsa false döner
function registerUser(username, password) {
  var allUsers = loadAllUsers();
  // Kullanıcı adının zaten alınıp alınmadığını kontrol et
  for (var i = 0; i < allUsers.length; i++) {
    if (allUsers[i].username === username) {
      return false;
    }
  }
  var newUser = {
    id: Date.now(),
    username: username,
    password: password
  };
  allUsers.push(newUser);
  saveUsers(allUsers);
  return true;
}

// Aktif oturum kullanıcısını kaydet
function setCurrentUser(user) {
  localStorage.setItem("driveEaseCurrentUser", JSON.stringify(user));
}

// Aktif oturum kullanıcısını al
function getCurrentUser() {
  var data = localStorage.getItem("driveEaseCurrentUser");
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

// Çıkış yap
function logoutUser() {
  localStorage.removeItem("driveEaseCurrentUser");
  window.location.href = "login.html";
}

// Navbar'da giriş yapmış kullanıcıyı göster (her sayfada çağrılır)
function updateNavUser() {
  var userArea = document.getElementById("userArea");
  if (!userArea) return;

  var user = getCurrentUser();
  if (user) {
    userArea.innerHTML =
      '<span id="loggedUserName"><i class="fa-solid fa-circle-user"></i> ' + user.username + '</span>' +
      ' <button class="btn btn-outline btn-sm" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>';
  } else {
    userArea.innerHTML =
      '<a href="login.html" class="btn btn-outline"><i class="fa-solid fa-right-to-bracket"></i> Login</a>' +
      ' <a href="register.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-user-plus"></i> Register</a>';
  }
}
