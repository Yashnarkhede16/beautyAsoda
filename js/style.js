document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const progressBar = document.getElementById("scroll-progress");
  const parallaxEl = document.querySelector("[data-parallax]");

  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Ensure every image loads cleanly (fallback to images/all.png if a path fails)
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.src = "images/all.png";
      }
    });
  });

  // Mobile menu
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll progress, sticky header & hero parallax
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && docHeight > 0) {
      progressBar.style.width = `${Math.min(100, (scrollTop / docHeight) * 100)}%`;
    }

    if (header) {
      header.classList.toggle("scrolled", scrollTop > 40);
    }

    if (parallaxEl && window.innerWidth > 768) {
      const speed = parseFloat(parallaxEl.dataset.parallax || "0.2");
      parallaxEl.style.transform = `translate3d(0, ${Math.min(90, scrollTop * speed)}px, 0)`;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Staggered reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));

  // Service inquiry jump
  const serviceSelect = document.getElementById("serviceSelect");
  document.querySelectorAll(".inquire-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const service = btn.dataset.service;
      if (serviceSelect && service) {
        serviceSelect.value = service;
      }
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Gallery filter
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const match = filter === "all" || item.dataset.group === filter;
        item.classList.toggle("hidden-item", !match);
        if (match) item.classList.add("visible");
      });
    });
  });

  // Lightbox modal
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  let currentIndex = 0;

  const visibleItems = () => galleryItems.filter((el) => !el.classList.contains("hidden-item"));

  const openLightbox = (index) => {
    const list = visibleItems();
    if (!list.length) return;
    currentIndex = (index + list.length) % list.length;
    const item = list[currentIndex];
    lightboxImg.src = item.dataset.src;
    lightboxImg.alt = item.dataset.caption || "Gallery photo";
    lightboxCaption.textContent = item.dataset.caption || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const list = visibleItems();
      openLightbox(list.indexOf(item));
    });
  });

  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", () => openLightbox(currentIndex - 1));
  nextBtn?.addEventListener("click", () => openLightbox(currentIndex + 1));

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
  });

  // Confirmation Validation (Date, Time & Existing Slot Check)
  const bookingForm = document.getElementById("bookingForm");
  const nameInput = document.getElementById("clientName");
  const phoneInput = document.getElementById("clientPhone");
  const dateInput = document.getElementById("eventDate");
  const timeInput = document.getElementById("eventTime");
  const formStatus = document.getElementById("formStatus");
  const bookedSlotsList = document.getElementById("bookedSlotsList");

  // Prevent picking past calendar dates
  const todayStr = new Date().toISOString().split("T")[0];
  if (dateInput) dateInput.min = todayStr;

  // Existing booked slots (date + time)
  const bookedSlots = [
    { date: "2026-12-05", time: "10:00", service: "Bridal Makeup" },
    { date: "2026-12-05", time: "14:30", service: "Halad & Mehndi Looks" },
    { date: "2026-12-12", time: "11:00", service: "Party & Sider Makeup" }
  ];

  const renderBookedSlots = () => {
    if (!bookedSlotsList) return;
    bookedSlotsList.innerHTML = bookedSlots
      .map((s) => `<li>${s.date} at ${s.time} — ${s.service}</li>`)
      .join("");
  };
  renderBookedSlots();

  const setFieldInvalid = (el, isInvalid) => {
    if (!el) return;
    el.classList.toggle("invalid", isInvalid);
  };

  const showStatus = (message, type) => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type || ""}`.trim();
  };

  [nameInput, phoneInput, dateInput, timeInput].forEach((input) => {
    input?.addEventListener("input", () => {
      setFieldInvalid(input, false);
      showStatus("", "");
    });
  });

  bookingForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput?.value.trim() || "";
    const phoneDigits = (phoneInput?.value || "").replace(/\D/g, "");
    const selectedDate = dateInput?.value || "";
    const selectedTime = timeInput?.value || "";
    const service = serviceSelect?.value || "Appointment";

    setFieldInvalid(nameInput, false);
    setFieldInvalid(phoneInput, false);
    setFieldInvalid(dateInput, false);
    setFieldInvalid(timeInput, false);

    if (!name) {
      setFieldInvalid(nameInput, true);
      showStatus("Please enter your name before confirming.", "error");
      nameInput?.focus();
      return;
    }

    if (phoneDigits.length < 10) {
      setFieldInvalid(phoneInput, true);
      showStatus("Please enter a valid 10-digit phone/WhatsApp number.", "error");
      phoneInput?.focus();
      return;
    }

    if (!selectedDate && !selectedTime) {
      setFieldInvalid(dateInput, true);
      setFieldInvalid(timeInput, true);
      showStatus("Cannot confirm: please select both an appointment date and time.", "error");
      dateInput?.focus();
      return;
    }

    if (!selectedDate) {
      setFieldInvalid(dateInput, true);
      showStatus("Cannot confirm: appointment date is not selected.", "error");
      dateInput?.focus();
      return;
    }

    if (!selectedTime) {
      setFieldInvalid(timeInput, true);
      showStatus("Cannot confirm: appointment time is not selected.", "error");
      timeInput?.focus();
      return;
    }

    const chosenDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (Number.isNaN(chosenDateTime.getTime()) || chosenDateTime <= new Date()) {
      setFieldInvalid(dateInput, true);
      setFieldInvalid(timeInput, true);
      showStatus("Cannot confirm: please choose a future date and time.", "error");
      return;
    }

    const alreadyBooked = bookedSlots.some(
      (slot) => slot.date === selectedDate && slot.time === selectedTime
    );
    if (alreadyBooked) {
      setFieldInvalid(dateInput, true);
      setFieldInvalid(timeInput, true);
      showStatus(
        `Slot unavailable: ${selectedDate} at ${selectedTime} is already booked at Dipali Beauty Palour, Asoda. Please choose another time or date.`,
        "error"
      );
      timeInput?.focus();
      return;
    }

    // Confirm and record slot in current session
    bookedSlots.push({ date: selectedDate, time: selectedTime, service });
    renderBookedSlots();
    showStatus(
      `Confirmed for ${name} — ${service} on ${selectedDate} at ${selectedTime} (Dipali Beauty Palour, Asoda).`,
      "success"
    );
    bookingForm.reset();
  });
});
