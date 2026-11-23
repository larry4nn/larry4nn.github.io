(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Theme Toggle (persisted via localStorage, respects prefers-color-scheme)
     ------------------------------------------------------------------------ */
  var themeBtn = document.getElementById("theme-toggle");
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      themeBtn.setAttribute(
        "title",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  if (themeBtn) {
    applyTheme(root.getAttribute("data-theme") || "light");
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (_) {}
    });
  }

  /* ------------------------------------------------------------------------
     Copy to Clipboard Utility (Email & BibTeX)
     ------------------------------------------------------------------------ */
  function copyText(text, btn, defaultLabel) {
    if (!text) return;
    var done = function () {
      btn.classList.add("is-copied");
      btn.textContent = "Copied";
      window.setTimeout(function () {
        btn.classList.remove("is-copied");
        btn.textContent = defaultLabel;
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {}
    document.body.removeChild(ta);
  }

  var emailCopyBtn = document.getElementById("copy-email-btn");
  if (emailCopyBtn) {
    emailCopyBtn.addEventListener("click", function () {
      copyText(emailCopyBtn.getAttribute("data-copy"), emailCopyBtn, "Copy");
    });
  }

  /* ------------------------------------------------------------------------
     Inline BibTeX Drawers
     ------------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".bibtex-trigger");
    if (trigger) {
      var targetId = trigger.getAttribute("aria-controls");
      var drawer = targetId ? document.getElementById(targetId) : null;
      if (!drawer) return;
      var isOpen = drawer.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    var copyBibBtn = e.target.closest(".bibtex-copy-btn");
    if (copyBibBtn) {
      var pre = copyBibBtn.closest(".bibtex-drawer").querySelector(".bibtex-pre");
      if (pre) {
        copyText(pre.textContent.trim(), copyBibBtn, "Copy BibTeX");
      }
    }
  });

  /* ------------------------------------------------------------------------
     Publication Category Filtering
     ------------------------------------------------------------------------ */
  var filterTabs = document.querySelectorAll(".filter-tab");
  var pubItems = document.querySelectorAll(".pub-item");
  var pubGroups = document.querySelectorAll(".pub-group");

  if (filterTabs.length && pubItems.length) {
    filterTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-filter");

        filterTabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });

        pubItems.forEach(function (item) {
          var cats = (item.getAttribute("data-category") || "").split(/\s+/);
          var match = filter === "all" || cats.indexOf(filter) !== -1;
          item.classList.toggle("is-hidden", !match);
        });

        pubGroups.forEach(function (group) {
          var visible = group.querySelectorAll(".pub-item:not(.is-hidden)").length;
          group.classList.toggle("is-hidden", visible === 0);
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Subtle Navigation Scroll-Spy
     ------------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".site-nav a[href^='#']")
  );
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var setActiveNav = function (href) {
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", href !== null && link.getAttribute("href") === href);
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        if (window.scrollY < 100) {
          setActiveNav(null);
          return;
        }
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav("#" + entry.target.id);
          }
        });
      },
      { rootMargin: "-22% 0px -65% 0px", threshold: 0 }
    );
    sections.forEach(function (sec) {
      observer.observe(sec);
    });

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY < 100) {
          setActiveNav(null);
        }
      },
      { passive: true }
    );
  }
})();
