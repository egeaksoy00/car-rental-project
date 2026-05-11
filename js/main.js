// DriveEase - CTIS255 DOM Project
// Uses only basic DOM, Events, Forms, localStorage and Timers.

document.addEventListener("DOMContentLoaded", function () {
  setupAuthModal();
  setupHomePage();
  setupCarsPage();
  setupRentalsPage();
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

function saveAction(actionText) {
  let actions = JSON.parse(localStorage.getItem("driveEaseActions")) || [];

  actions.push({
    action: actionText,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("driveEaseActions", JSON.stringify(actions));
  console.log("Action saved:", actionText);
}

function setupAuthModal() {
  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("authModal");
  const closeModal = document.getElementById("closeModal");
  const authForm = document.getElementById("authForm");

  if (!loginBtn || !modal) return;

  loginBtn.addEventListener("click", function () {
    modal.classList.add("show");
  });

  closeModal.addEventListener("click", function () {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.remove("show");
    }
  });

  authForm.addEventListener("submit", function (event) {
    event.preventDefault();
    modal.classList.remove("show");
    saveAction("Demo login/signup button used");
    showToast("Demo login completed");
  });
}

function setupHomePage() {
  const availableCount = document.getElementById("availableCount");
  const featuredCars = document.getElementById("featuredCars");

  if (!availableCount || !featuredCars) return;

  const cards = featuredCars.querySelectorAll(".car-card");
  let count = 0;

  cards.forEach(function (card) {
    if (card.dataset.status === "Available") {
      count++;
    }
  });

  availableCount.textContent = count;

  featuredCars.addEventListener("click", function (event) {
    const card = event.target.closest(".car-card");
    if (!card) return;

    showToast(card.dataset.brand + " " + card.dataset.model + " selected");
    saveAction("Featured car selected: " + card.dataset.brand + " " + card.dataset.model);
  });
}

function setupCarsPage() {
  const carsList = document.getElementById("carsList");
  const carForm = document.getElementById("carForm");

  if (!carsList || !carForm) return;

  let cars = loadCarsFromHTML();

  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const clearFormBtn = document.getElementById("clearFormBtn");
  const resetCarsBtn = document.getElementById("resetCarsBtn");

  saveCars();

  carsList.addEventListener("click", function (event) {
    const card = event.target.closest(".car-card");
    if (!card) return;

    const carId = Number(card.dataset.id);

    if (event.target.matches(".detail-btn")) {
      showCarDetails(card);
    }

    if (event.target.matches(".edit-btn")) {
      fillCarForm(carId);
    }

    if (event.target.matches(".delete-btn")) {
      deleteCar(carId);
    }
  });

  searchInput.addEventListener("input", renderCars);
  statusFilter.addEventListener("change", renderCars);

  carForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const idValue = document.getElementById("carId").value;
    const existingCar = idValue ? cars.find(function (item) {
      return item.id === Number(idValue);
    }) : null;

    const car = {
      id: idValue ? Number(idValue) : Date.now(),
      brand: document.getElementById("brand").value.trim(),
      model: document.getElementById("model").value.trim(),
      year: document.getElementById("year").value,
      price: document.getElementById("price").value,
      status: document.getElementById("status").value,
      type: existingCar ? existingCar.type : "Sedan",
      image: existingCar ? existingCar.image : "car-placeholder.jpg"
    };

    if (idValue) {
      cars = cars.map(function (item) {
        return item.id === car.id ? car : item;
      });
      showToast("Car updated");
      saveAction("Car updated: " + car.brand + " " + car.model);
    } else {
      cars.push(car);
      showToast("Car added");
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

  function loadCarsFromHTML() {
    const savedCars = localStorage.getItem("driveEaseCars");

    if (savedCars) {
      const parsedCars = JSON.parse(savedCars);

      // Fix old localStorage records that used different property names.
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

    const cards = carsList.querySelectorAll(".car-card");
    const list = [];

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
    const keyword = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    carsList.innerHTML = "";

    const filteredCars = cars.filter(function (car) {
      const fullName = (car.brand + " " + car.model).toLowerCase();
      const matchesSearch = fullName.indexOf(keyword) !== -1;
      const matchesStatus = selectedStatus === "All" || car.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    if (filteredCars.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-text";
      empty.textContent = "No cars found.";
      carsList.append(empty);
      return;
    }

    filteredCars.forEach(function (car) {
      const article = document.createElement("article");
      article.className = "car-card";
      article.dataset.id = car.id;
      article.dataset.brand = car.brand;
      article.dataset.model = car.model;
      article.dataset.year = car.year;
      article.dataset.price = car.price;
      article.dataset.status = car.status;
      article.dataset.type = car.type;
      article.dataset.image = car.image;

      const img = document.createElement("img");
      img.src = "images/" + car.image;
      img.alt = car.brand + " " + car.model;

      const body = document.createElement("div");
      body.className = "car-body";

      const badge = document.createElement("span");
      badge.className = "badge " + car.status.toLowerCase();
      badge.textContent = car.status;

      const title = document.createElement("h3");
      title.textContent = car.brand + " " + car.model;

      const info = document.createElement("p");
      info.textContent = car.year + " • " + car.type;

      const price = document.createElement("strong");
      price.textContent = car.price + " TL / day";

      const actions = document.createElement("div");
      actions.className = "card-actions";
      actions.innerHTML = '<button class="btn-small detail-btn">Details</button><button class="btn-small edit-btn">Edit</button><button class="btn-small danger delete-btn">Delete</button>';

      body.append(badge, title, info, price, actions);
      article.append(img, body);
      carsList.append(article);
    });
  }

  function showCarDetails(card) {
    const panel = document.getElementById("detailPanel");
    const title = document.getElementById("detailTitle");
    const text = document.getElementById("detailText");

    title.textContent = card.dataset.brand + " " + card.dataset.model;
    text.innerHTML =
      "<b>Year:</b> " + card.dataset.year + "<br>" +
      "<b>Type:</b> " + card.dataset.type + "<br>" +
      "<b>Price:</b> " + card.dataset.price + " TL/day<br>" +
      "<b>Status:</b> " + card.dataset.status;

    panel.classList.add("open");
    saveAction("Car details viewed: " + title.textContent);
  }

  function fillCarForm(id) {
    const car = cars.find(function (item) {
      return item.id === id;
    });

    if (!car) return;

    document.getElementById("carId").value = car.id;
    document.getElementById("brand").value = car.brand;
    document.getElementById("model").value = car.model;
    document.getElementById("year").value = car.year;
    document.getElementById("price").value = car.price;
    document.getElementById("status").value = car.status;

    showToast("Car loaded into form");
  }

  function deleteCar(id) {
    cars = cars.filter(function (car) {
      return car.id !== id;
    });

    saveCars();
    renderCars();
    saveAction("Car deleted");
    showToast("Car deleted");
  }

  function clearCarForm() {
    carForm.reset();
    document.getElementById("carId").value = "";
  }
}

function setupRentalsPage() {
  const rentalForm = document.getElementById("rentalForm");
  const rentalList = document.getElementById("rentalList");

  if (!rentalForm || !rentalList) return;

  let rentals = JSON.parse(localStorage.getItem("driveEaseRentals")) || [];

  const rentalCar = document.getElementById("rentalCar");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const pricePreview = document.getElementById("pricePreview");

  rentalCar.addEventListener("change", updatePricePreview);
  startDate.addEventListener("change", updatePricePreview);
  endDate.addEventListener("change", updatePricePreview);

  rentalForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const idValue = document.getElementById("rentalId").value;
    const selectedOption = rentalCar.options[rentalCar.selectedIndex];
    const total = calculateTotal();

    const rental = {
      id: idValue ? Number(idValue) : Date.now(),
      customer: document.getElementById("customerName").value.trim(),
      car: rentalCar.value,
      price: selectedOption.dataset.price,
      start: startDate.value,
      end: endDate.value,
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
    updatePricePreview();
  });

  rentalList.addEventListener("click", function (event) {
    const item = event.target.closest(".rental-item");
    if (!item) return;

    const id = Number(item.dataset.id);

    if (event.target.matches(".edit-rental")) {
      editRental(id);
    }

    if (event.target.matches(".cancel-rental")) {
      cancelRental(id);
    }
  });

  document.getElementById("clearRentalBtn").addEventListener("click", function () {
    rentalForm.reset();
    document.getElementById("rentalId").value = "";
    updatePricePreview();
  });

  document.getElementById("clearRentalsBtn").addEventListener("click", function () {
    rentals = [];
    saveRentals();
    renderRentals();
    showToast("Rentals cleared");
  });

  renderRentals();
  updatePricePreview();

  function calculateTotal() {
    const selectedOption = rentalCar.options[rentalCar.selectedIndex];
    if (!selectedOption || !selectedOption.dataset.price || !startDate.value || !endDate.value) {
      return 0;
    }

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    const difference = end - start;
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (days <= 0) return 0;

    return days * Number(selectedOption.dataset.price);
  }

  function updatePricePreview() {
    pricePreview.textContent = "Total: " + calculateTotal() + " TL";
  }

  function saveRentals() {
    localStorage.setItem("driveEaseRentals", JSON.stringify(rentals));
  }

  function renderRentals() {
    rentalList.innerHTML = "";

    if (rentals.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-text";
      empty.textContent = "No rentals yet.";
      rentalList.append(empty);
      return;
    }

    rentals.forEach(function (rental) {
      const item = document.createElement("article");
      item.className = "rental-item";
      item.dataset.id = rental.id;

      item.innerHTML =
        "<h3>" + rental.customer + "</h3>" +
        "<p><b>Car:</b> " + rental.car + "</p>" +
        "<p><b>Date:</b> " + rental.start + " to " + rental.end + "</p>" +
        "<p><b>Total:</b> " + rental.total + " TL</p>" +
        '<div class="card-actions"><button class="btn-small edit-rental">Edit</button><button class="btn-small danger cancel-rental">Cancel</button></div>';

      rentalList.append(item);
    });
  }

  function editRental(id) {
    const rental = rentals.find(function (item) {
      return item.id === id;
    });

    if (!rental) return;

    document.getElementById("rentalId").value = rental.id;
    document.getElementById("customerName").value = rental.customer;
    rentalCar.value = rental.car;
    startDate.value = rental.start;
    endDate.value = rental.end;

    updatePricePreview();
    showToast("Rental loaded into form");
  }

  function cancelRental(id) {
    rentals = rentals.filter(function (rental) {
      return rental.id !== id;
    });

    saveRentals();
    renderRentals();
    saveAction("Rental cancelled");
    showToast("Rental cancelled");
  }
}
