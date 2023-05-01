(function ($) {
    'use strict';
    
    $.fn.checkBoxGroupDropdown = function (options) {
        $(this).each(function(){
            var $mainEl = $(this);
            var toggleBtn = $mainEl.find('.toggle-btn');
            var toggleTextEl = toggleBtn.find('.toggle-text');
            var toggleBtnOriginalText = toggleBtn.find('.toggle-text').text();
            var applyBtn = $mainEl.find('.apply-btn');
            var clearBtn = $mainEl.find('.clear-btn');
            var settings;

            // Setting defaults
            settings = $.extend({
                'maxAmount': 2
            }, options);

            // Apply checked class to dropdown item
            function applyCheckedClass(el) {
                
                // Remove has checked class no matter hwhat
                if (el.attr('type') === 'radio' && el.prop('checked') === true) {
                    $mainEl
                        .find('.b-dropdown-item')
                        .removeClass('js-is-checked');    
                }
                
                // Apply to correct input
                if (el.prop('checked') === true) {
                    el
                        .closest('.b-dropdown-item')
                        .addClass('js-is-checked');
                } else {
                    el
                        .closest('.b-dropdown-item')
                        .removeClass('js-is-checked');
                }
            }

            // Change toggle button text based on what's selected
            function updateDropdownToggleText(el, origText) {
                var $this = $(el);
                var checkedTextArr = [];
                var checkedEls = $this.find('input:checked');
                var checkedAmount = checkedEls.length;
                var currentAmount = 1;
               
                checkedEls.each(function () {
                    var current = currentAmount;
                    
                    // Add string to array
                    if (current <= settings.maxAmount) {
                        checkedTextArr.push($.trim($(this).closest('label').text()));
                    }

                    currentAmount++;
                });
                
                // Add/remove text and required class to toggle button
                if (checkedAmount === 0) {
                    toggleBtn.removeClass('js-has-checked');
                    toggleTextEl.text(origText);
                } else if (checkedAmount <= settings.maxAmount) {
                    toggleBtn.addClass('js-has-checked');
                    toggleTextEl.text(checkedTextArr.join(', '));
                } else {
                    toggleBtn.addClass('js-has-checked');
                    toggleTextEl.text(checkedAmount + ' selected');
                }

                // Apply control button states
                if (!checkedEls.length) {
                    $mainEl
                        .find('.apply-btn, .clear-btn')
                        .attr('disabled', 'disabled');
                } else {
                    $mainEl
                        .find('.apply-btn, .clear-btn')
                        .removeAttr('disabled');
                }
            }

            // Fire on load
            updateDropdownToggleText($mainEl, toggleBtnOriginalText);
                        
            // Focus on first or selected item when dropdown is fired
            var shownHandler = ($mainEl.find('[data-toggle="dropdown"]').length) ? 'shown.bs.dropdown' : 'shown.dropdown';
            $mainEl.on(shownHandler, function() {                            
                var focusOnThisEl = ($mainEl.find('.js-is-checked').length) ? $mainEl.find('.js-is-checked').first('> input') : $mainEl.find('.b-dropdown-item').first().find('input');
                
                focusOnThisEl.focus();
            });
            
            // Changes when checkbox is selected
            $mainEl.find('[type="checkbox"], [type="radio"], label.b-dropdown-item').each(function () {
                var $this = $(this);

                applyCheckedClass($this);

                $this.on('click', function(e){ 
                    var eTarget = $(e.target);
                    
                    e.stopImmediatePropagation();

                    if (eTarget.closest('.dropdown-menu').attr('data-toggle') !== 'dropdown') {
                        e.stopPropagation();
                    }
        
                    applyCheckedClass($(this));
                    updateDropdownToggleText($mainEl, toggleBtnOriginalText);
                });
            });
            
            // Apply button
            applyBtn.on('click', function () {
                $(this)
                    .closest('.b-dropdown')
                    .find('.toggle-btn')
                    .attr('aria-expanded', false)
                    .trigger('click')
                    .focus();
            });

            // Clear all button
            clearBtn.on('click', function() {
                $mainEl
                    .find('input:checked')
                    .each(function(){
                        $(this)
                            .prop('checked', false)
                            .closest('.js-is-checked')
                            .removeClass('js-is-checked');
                    })
                    .find('.toggle-btn')
                    .removeClass('js-has-checked');

                updateDropdownToggleText($mainEl, toggleBtnOriginalText);

                // Close dropdown by triggering apply button click
                applyBtn.trigger('click');
            });
            
            // First letter type focus first on entry
            $mainEl.on('keydown', function (e) {
                var $this = $(this);
                
                $this
                    .find('.b-dropdown-item')
                    .each(function(){
                        var firstLetter = $.trim($(this).text()).charAt(0).toLowerCase();
                        if ( firstLetter === String.fromCharCode(e.which).toLowerCase() ) {
                            $(this).focus();
                            return false;
                        }
                    });
            });
        });
    };
}(jQuery));