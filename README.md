# DriveEase — Car Rental Management System

CTIS 255 Frontend Web Technologies project.

## Project Structure

```
├── index.html            # Home page (hero, stats, featured cars)
├── cars.html             # Car listing, add/delete, search & filter
├── rentals.html          # Rental records, create/edit/cancel
├── login.html            # Login page (username + password)
├── register.html         # Register page (username + password)
│
└── assets/
    ├── css/
    │   └── style.css     # All styles (no Bootstrap, vanilla CSS)
    ├── scripts/
    │   ├── auth.js       # Login, register, logout, session (localStorage)
    │   └── main.js       # Cars page logic, rentals page logic, DOM manipulation
    └── images/
        ├── audi-a3.jpg
        ├── bmw-320i.jpg
        ├── mercedes-c200.jpg
        ├── toyota-corolla.jpg
        ├── car-placeholder.jpg
        └── favicon.svg
```

## Demo Accounts

| Username | Password |
|----------|----------|
| admin    | 1234     |
| ali      | ali123   |
| ayse     | ayse123  |

## Features

- User login / register / logout with `localStorage` session
- Car listing with search (by brand/model) and status filter
- Add and delete cars (saved to `localStorage`)
- Rental records: create, edit and cancel (saved to `localStorage`)
- Detail side panel for car info
- Responsive layout (mobile hamburger menu)
- Toast notifications

## JavaScript Concepts Used

- `var` variables, functions, `for` loops
- DOM access: `getElementById`, `getElementsByTagName`, `querySelectorAll`
- DOM manipulation: `createElement`, `append`, `innerHTML`, `textContent`
- `classList` (add / remove / toggle)
- `dataset` attributes
- `addEventListener` (submit, click, input, change)
- Event delegation via `event.target.closest()` and `event.target.matches()`
- `localStorage`: `setItem`, `getItem`, `removeItem`
- `JSON.stringify` / `JSON.parse`
- `setTimeout` / `setInterval`
- Array methods: `forEach`, `filter`, `find`, `map`, `push`
- Object literals and object arrays
