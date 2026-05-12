// main.js - DriveEase Araç Kiralama Sistemi
// DOM manipülasyonu, olaylar, formlar, localStorage ve zamanlayıcılar kullanır.
// Kullanıcı oturumu için auth.js ile birlikte çalışır.

document.addEventListener("DOMContentLoaded", function () {
  setupHomePage();
  setupCarsPage();
  setupRentalsPage();
});

//  Toast Bildirimi 
function showToast(message) {
  var toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

//  İşlem logunu localstora kaydet 
function saveAction(actionText) {
  var actions = JSON.parse(localStorage.getItem("driveEaseActions")) || [];

  actions.push({
    action: actionText,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("driveEaseActions", JSON.stringify(actions));
}

//  Ana Sayfa 
function setupHomePage() {
  var availableCount = document.getElementById("availableCount");
  var featuredCars = document.getElementById("featuredCars");

  if (!availableCount || !featuredCars) return;

  // HTML kartlarından araç sayısnı bul sadece avaliablar
  var cards = featuredCars.querySelectorAll(".car-card");
  var count = 0;

  cards.forEach(function (card) {
    if (card.dataset.status === "Available") {
      count++;
    }
  });

  availableCount.textContent = count;

  // Öne çıkan araç kartına tıklama
  featuredCars.addEventListener("click", function (event) {
    var card = event.target.closest(".car-card");
    if (!card) return;

    showToast(card.dataset.brand + " " + card.dataset.model + " selected");
    saveAction("Featured car clicked: " + card.dataset.brand + " " + card.dataset.model);
  });
}

//  Araçlar Sayfası 
function setupCarsPage() {
  var carsList = document.getElementById("carsList");
  var carForm = document.getElementById("carForm");

  if (!carsList || !carForm) return;

  var cars = loadCarsFromHTML();

  var searchInput = document.getElementById("searchInput");
  var statusFilter = document.getElementById("statusFilter");
  var clearFormBtn = document.getElementById("clearFormBtn");
  var resetCarsBtn = document.getElementById("resetCarsBtn");

  // Başlangıç araçlarını kaydet
  saveCars();
  renderCars();

  // Araç listesi tıklama  (Detay, Sil)
  carsList.addEventListener("click", function (event) {
    var card = event.target.closest(".car-card");
    if (!card) return;

    var carId = Number(card.dataset.id);

    if (event.target.matches(".detail-btn") || event.target.closest(".detail-btn")) {
      showCarDetails(card);
    }

    if (event.target.matches(".delete-btn") || event.target.closest(".delete-btn")) {
      deleteCar(carId);
    }
  });

  // Arama ve filtre
  searchInput.addEventListener("input", renderCars);
  statusFilter.addEventListener("change", renderCars);

  //  araç ekle veya güncelle
  carForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // --- Form Doğrulama ---
    var brandVal = document.getElementById("brand").value.trim();
    var modelVal = document.getElementById("model").value.trim();
    var yearVal = document.getElementById("year").value;
    var priceVal = document.getElementById("price").value;
    var valid = true;

    clearCarErrors();

    if (brandVal === "") {
      document.getElementById("brandError").textContent = "Brand cannot be empty.";
      valid = false;
    }
    if (modelVal === "") {
      document.getElementById("modelError").textContent = "Model cannot be empty.";
      valid = false;
    }

    if (priceVal === "" || Number(priceVal) < 1) {
      document.getElementById("priceError").textContent = "Enter a valid price.";
      valid = false;
    }
    if (!valid) return;
    // --- Doğrulama Sonu ---

    var idValue = document.getElementById("carId").value;
    var existingCar = idValue ? cars.find(function (item) {
      return item.id === Number(idValue);
    }) : null;

    var car = {
      id: idValue ? Number(idValue) : Date.now(),
      brand: brandVal,
      model: modelVal,
      year: yearVal,
      price: priceVal,
      status: document.getElementById("status").value,
      type: existingCar ? existingCar.type : "Sedan",
      image: existingCar ? existingCar.image : "car-placeholder.jpg"
    };

    if (idValue) {
      cars = cars.map(function (item) {
        return item.id === car.id ? car : item;
      });
      showToast("Car updated successfully");
      saveAction("Car updated: " + car.brand + " " + car.model);
    } else {
      cars.push(car);
      showToast("Car added successfully");
      saveAction("Car added: " + car.brand + " " + car.model);
    }

    saveCars();
    renderCars();
    clearCarForm();
  });

  clearFormBtn.addEventListener("click", clearCarForm);

  resetCarsBtn.addEventListener("click", function () {
    localStorage.removeItem("driveEaseCars");
    location.reload();
  });

  document.getElementById("closeDetail").addEventListener("click", function () {
    document.getElementById("detailPanel").classList.remove("open");
  });

  // İç Fonksiyonlar 

  function loadCarsFromHTML() {
    var savedCars = localStorage.getItem("driveEaseCars");

    if (savedCars) {
      var parsedCars = JSON.parse(savedCars);

      return parsedCars.map(function (car) {
        return {
          id: Number(car.id),
          brand: car.brand || "Unknown",
          model: car.model || "Model",
          year: car.year || "2024",
          price: car.price || car.pricePerDay || "0",
          status: car.status || "Available",
          type: car.type || "Sedan",
          image: car.image || "car-placeholder.jpg"
        };
      });
    }

    // HTML data  oku (başlangıç durumu)
    var cards = carsList.querySelectorAll(".car-card");
    var list = [];

    cards.forEach(function (card) {
      list.push({
        id: Number(card.dataset.id),
        brand: card.dataset.brand,
        model: card.dataset.model,
        year: card.dataset.year,
        price: card.dataset.price,
        status: card.dataset.status,
        type: card.dataset.type || "Sedan",
        image: card.dataset.image || "car-placeholder.jpg"
      });
    });

    return list;
  }

  function saveCars() {
    localStorage.setItem("driveEaseCars", JSON.stringify(cars));
  }

  function renderCars() {
    var keyword = searchInput.value.toLowerCase();
    var selectedStatus = statusFilter.value;

    carsList.innerHTML = "";

    var filteredCars = cars.filter(function (car) {
      var fullName = (car.brand + " " + car.model).toLowerCase();
      var matchesSearch = fullName.indexOf(keyword) !== -1;
      var matchesStatus = selectedStatus === "All" || car.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    if (filteredCars.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-text";
      empty.textContent = "No cars found.";
      carsList.append(empty);
      return;
    }

    filteredCars.forEach(function (car) {
      var article = document.createElement("article");
      article.className = "car-card";
      article.dataset.id = car.id;
      article.dataset.brand = car.brand;
      article.dataset.model = car.model;
      article.dataset.year = car.year;
      article.dataset.price = car.price;
      article.dataset.status = car.status;
      article.dataset.type = car.type;
      article.dataset.image = car.image;

      var img = document.createElement("img");
      img.src = "assets/images/" + car.image;
      img.alt = car.brand + " " + car.model;

      var body = document.createElement("div");
      body.className = "car-body";

      var badge = document.createElement("span");
      badge.className = "badge " + car.status.toLowerCase();
      badge.textContent = car.status;

      var title = document.createElement("h3");
      title.textContent = car.brand + " " + car.model;

      var info = document.createElement("p");
      info.textContent = car.year + " \u2022 " + car.type;

      var price = document.createElement("strong");
      price.textContent = car.price + " TL / day";

      var actions = document.createElement("div");
      actions.className = "card-actions";
      actions.innerHTML =
        '<button class="btn-small detail-btn"><i class="fa-solid fa-circle-info"></i> Details</button>' +
        '<button class="btn-small danger delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>';

      body.append(badge, title, info, price, actions);
      article.append(img, body);
      carsList.append(article);
    });
  }

  function showCarDetails(card) {
    var panel = document.getElementById("detailPanel");
    var title = document.getElementById("detailTitle");
    var text = document.getElementById("detailText");

    title.textContent = card.dataset.brand + " " + card.dataset.model;
    text.innerHTML =
      "<b>Year:</b> " + card.dataset.year + "<br>" +
      "<b>Type:</b> " + card.dataset.type + "<br>" +
      "<b>Price:</b> " + card.dataset.price + " TL/day<br>" +
      "<b>Status:</b> " + card.dataset.status;

    panel.classList.add("open");
    saveAction("Viewed details: " + title.textContent);
  }


  function deleteCar(id) {
    cars = cars.filter(function (car) {
      return car.id !== id;
    });
    saveCars();
    renderCars();
    saveAction("Car deleted (id=" + id + ")");
    showToast("Car deleted");
  }

  function clearCarForm() {
    carForm.reset();
    document.getElementById("carId").value = "";
    clearCarErrors();
  }

  function clearCarErrors() {
    var errorFields = ["brandError", "modelError", "yearError", "priceError"];
    errorFields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = "";
    });
  }
}

// ---- Kiralamalar Sayfası ----
function setupRentalsPage() {
  var rentalForm = document.getElementById("rentalForm");
  var rentalList = document.getElementById("rentalList");

  if (!rentalForm || !rentalList) return;

  var rentals = JSON.parse(localStorage.getItem("driveEaseRentals")) || [];

  var rentalCar = document.getElementById("rentalCar");
  var startDate = document.getElementById("startDate");
  var endDate = document.getElementById("endDate");
  var pricePreview = document.getElementById("pricePreview");

  rentalCar.addEventListener("change", updatePricePreview);
  startDate.addEventListener("change", updatePricePreview);
  endDate.addEventListener("change", updatePricePreview);

  rentalForm.addEventListener("submit", function (event) {
    event.preventDefault();

    //  Kiralama  Doğrulama 
    var customerVal = document.getElementById("customerName").value.trim();
    var carVal = rentalCar.value;
    var startVal = startDate.value;
    var endVal = endDate.value;
    var valid = true;

    clearRentalErrors();

    if (customerVal === "") {
      document.getElementById("customerError").textContent = "Customer name is required.";
      valid = false;
    }
    if (carVal === "") {
      document.getElementById("carError").textContent = "Please select a car.";
      valid = false;
    }
    if (startVal === "") {
      document.getElementById("startError").textContent = "Start date is required.";
      valid = false;
    }
    if (endVal === "") {
      document.getElementById("endError").textContent = "End date is required.";
      valid = false;
    }
    if (startVal && endVal && endVal <= startVal) {
      document.getElementById("endError").textContent = "End date must be after start date.";
      valid = false;
    }
    if (!valid) return;
    //  Doğrulama bitti sonu

    var idValue = document.getElementById("rentalId").value;
    var selectedOption = rentalCar.options[rentalCar.selectedIndex];
    var total = calculateTotal();

    var rental = {
      id: idValue ? Number(idValue) : Date.now(),
      customer: customerVal,
      car: carVal,
      price: selectedOption.dataset.price,
      start: startVal,
      end: endVal,
      total: total
    };

    if (idValue) {
      rentals = rentals.map(function (item) {
        return item.id === rental.id ? rental : item;
      });
      showToast("Rental updated");
      saveAction("Rental updated: " + rental.car);
    } else {
      rentals.push(rental);
      showToast("Rental created");
      saveAction("Rental created: " + rental.car);
    }

    saveRentals();
    renderRentals();
    rentalForm.reset();
    document.getElementById("rentalId").value = "";
    clearRentalErrors();
    updatePricePreview();
  });

  // Kiralama listesi tıklama
  rentalList.addEventListener("click", function (event) {
    var item = event.target.closest(".rental-item");
    if (!item) return;

    var id = Number(item.dataset.id);

    if (event.target.matches(".edit-rental") || event.target.closest(".edit-rental")) {
      editRental(id);
    }
    if (event.target.matches(".cancel-rental") || event.target.closest(".cancel-rental")) {
      cancelRental(id);
    }
  });

  document.getElementById("clearRentalBtn").addEventListener("click", function () {
    rentalForm.reset();
    document.getElementById("rentalId").value = "";
    clearRentalErrors();
    updatePricePreview();
  });

  document.getElementById("clearRentalsBtn").addEventListener("click", function () {
    rentals = [];
    saveRentals();
    renderRentals();
    showToast("All rentals cleared");
  });

  renderRentals();
  updatePricePreview();



  function calculateTotal() {
    var selectedOption = rentalCar.options[rentalCar.selectedIndex];
    if (!selectedOption || !selectedOption.dataset.price || !startDate.value || !endDate.value) {
      return 0;
    }

    var start = new Date(startDate.value);
    var end = new Date(endDate.value);
    var difference = end - start;
    var days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (days <= 0) return 0;

    return days * Number(selectedOption.dataset.price);
  }

  function updatePricePreview() {
    var total = calculateTotal();
    pricePreview.innerHTML = '<i class="fa-solid fa-tag"></i> Total: ' + total + ' TL';
  }

  function saveRentals() {
    localStorage.setItem("driveEaseRentals", JSON.stringify(rentals));
  }

  function renderRentals() {
    rentalList.innerHTML = "";

    if (rentals.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-text";
      empty.textContent = "No rentals yet.";
      rentalList.append(empty);
      return;
    }

    rentals.forEach(function (rental) {
      var item = document.createElement("article");
      item.className = "rental-item";
      item.dataset.id = rental.id;

      item.innerHTML =
        "<h3>" + rental.customer + "</h3>" +
        "<p><b>Car:</b> " + rental.car + "</p>" +
        "<p><b>Date:</b> " + rental.start + " to " + rental.end + "</p>" +
        "<p><b>Total:</b> " + rental.total + " TL</p>" +
        '<div class="card-actions">' +
        '<button class="btn-small edit-rental"><i class="fa-solid fa-pen"></i> Edit</button>' +
        '<button class="btn-small danger cancel-rental"><i class="fa-solid fa-trash"></i> Cancel</button>' +
        '</div>';

      rentalList.append(item);
    });
  }

  function editRental(id) {
    var rental = rentals.find(function (item) {
      return item.id === id;
    });
    if (!rental) return;

    document.getElementById("rentalId").value = rental.id;
    document.getElementById("customerName").value = rental.customer;
    rentalCar.value = rental.car;
    startDate.value = rental.start;
    endDate.value = rental.end;

    clearRentalErrors();
    updatePricePreview();
    showToast("Rental loaded into form");
  }

  function cancelRental(id) {
    rentals = rentals.filter(function (rental) {
      return rental.id !== id;
    });
    saveRentals();
    renderRentals();
    saveAction("Rental cancelled (id=" + id + ")");
    showToast("Rental cancelled");
  }

  function clearRentalErrors() {
    var errorFields = ["customerError", "carError", "startError", "endError"];
    errorFields.forEach(function (fieldId) {
      var el = document.getElementById(fieldId);
      if (el) el.textContent = "";
    });
  }
}
