/*!
    * Simple Dropdown v2.0.0
    *
    * Copyright 2021-2023 Marshall Crosby
    * https://marshallcrosby.com
*/

(function ($) {
    'use strict';
    
    // Toggle attribute true/false method
    $.fn.toggleAttrBoolean = function (elAttr) {
        $(this).attr(elAttr,
            $(this).attr(elAttr) === 'false' ? 'true' : 'false'
        );
    };

    // Close dropdown method
    $.fn.closeDropdown = function () {
        var $this = $(this);

        $this
            .removeClass('js-dropdown-active')
            .closest('.b-dropdown')
            .removeClass('js-dropdown-active')
            .find('.toggle-btn')
            .toggleAttrBoolean('aria-expanded');

        $this
            .closest('.b-dropdown')
            .find('.b-dropdown-menu')
            .removeClass('js-is-showing');
    };
    
    // Assign data-arrow-index attr on the fly
    function assignArrowIndex(element) {
        var indexEl = (element.find('.b-dropdown-item > input').length) ? element.find('.b-dropdown-item > input, .clear-btn, .apply-btn') : element.find('.b-dropdown-item');
         
        indexEl.each(function(index){
            $(this)
                .removeAttr('data-arrow-index')
                .attr('data-arrow-index', index);
        });
    }

    function arrowToNextPrev(element, direction, focusIndex, e) {
        var upOrDown;
            
        if (direction === 'up') {
            upOrDown = focusIndex - 1;
        } else if (direction === 'down') {
            upOrDown = focusIndex + 1;
        }
        
        e.preventDefault();

        element
            .find($('[data-arrow-index=' + upOrDown + ']'))
            .focus();
    }
    
    $(window).on('select-to-dropdown.ready checkbox-group-dropdown.ready', function() {
        
        // Dropdown toggle clicking
        $('.b-dropdown').each(function() {
            var $dropdown = $(this);
            var dropdownToggle = $dropdown.find('.toggle-btn');
            var dropdownMenu = $dropdown.find('.b-dropdown-menu');
            

            dropdownToggle.on('click', function(e) {            
                e.preventDefault();
                
                $(this).toggleAttrBoolean('aria-expanded');
                
                $dropdown.toggleClass('js-dropdown-active');
                
                dropdownMenu.toggleClass('js-is-showing');

                
                if (dropdownMenu.hasClass('js-is-showing')) {
                    
                    // Shown event
                    $dropdown.trigger($.Event('shown.dropdown'));
                    
                    // Scroll into view if needed
                    var windowHeight = $(window).innerHeight(),
                        bottomOfViewport = $(window).scrollTop() + windowHeight,
                        dropdownBottomCoord = dropdownMenu.outerHeight() + (dropdownMenu.offset().top),
                        scrollBottomCoord = dropdownBottomCoord - windowHeight;
                                                        
                    if (dropdownBottomCoord > bottomOfViewport) {
                        $('html, body').animate({
                            scrollTop: scrollBottomCoord + 20
                        }, 250);
                    }
                }
            });
            
            // Initial arrow index assign            
            assignArrowIndex($dropdown);
            
            // Make arrow up/down keys tab through the entries
            $dropdown.on('keydown', function(e) {
                var $this = $(this);
                var keyEvent = e;
                var keyPressed = e.which;
                var currentFocusData = $(':focus').data('arrow-index');
                                
                // Down arrow
                if (keyPressed === 40) {
                    arrowToNextPrev($this, 'down', currentFocusData, e);
                }
                // Up arrow
                if (keyPressed === 38) {
                    arrowToNextPrev($this, 'up', currentFocusData, e);
                }
                
                // Tab key
                if (keyPressed === 9 && !$(e.target).is(dropdownToggle) && $dropdown.find('[data-arrow-index]').length) {
                    e.preventDefault();
                }                    
            });
            
            // Keyboarding
            $dropdown.on('keyup', function(e) {
                var $target = $(e.target);
            
                // Escape key
                if (
                    e.keyCode === 27 &&
                    $target.closest('.b-dropdown').length &&
                    $target.closest('.b-dropdown').find('.b-dropdown-menu').hasClass('js-is-showing')
                ) {
                    e.preventDefault();
                    $target
                        .closest('.b-dropdown')
                        .find('.toggle-btn')
                        .focus()
                        .closeDropdown();
                }
                
                // Tab key
                if (
                    e.keyCode === 9 &&
                    !$(document.activeElement).closest('.b-dropdown').find('.js-is-showing').length
                ) {
                    $('.b-dropdown-menu.js-is-showing').closeDropdown();
                }
            });
                        
            // Allow arrow down key to open dropdown
            dropdownToggle.on('keyup', function(e) {
                var $thisToggle = $(this);
                
                if (e.which === 40 && $thisToggle.attr('aria-expanded') === 'false') {
                    $(this).trigger('click');
                }
            });
        });
                
        // Close dropdown if clicking out of it
        $(document).on('click', function(e) {            
            var dropdown = $('.js-dropdown-active');
            
            dropdown.each(function() {
                var $this = $(this);
                
                //check if the clicked area is active dropdown or not
                if ($this.has(e.target).length === 0) {
                    $this.closeDropdown();
                }
            });
        });
    });
}(jQuery));
/*!
    * Checkbox Group Dropdown v2.0.0
    *
    * Copyright 2021-2023 Marshall Crosby
    * https://marshallcrosby.com
*/

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
            var shownHandler = ($mainEl.find('[data-toggle="dropdown"], [data-bs-toggle="dropdown"]').length) ? 'shown.bs.dropdown' : 'shown.dropdown';
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

                    if (eTarget.closest('.dropdown-menu').attr('data-toggle') || eTarget.closest('.dropdown-menu').attr('data-bs-toggle') !== 'dropdown') {
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
/*!
    * Select to Dropdown v2.0.0
    *
    * Copyright 2021-2023 Marshall Crosby
    * https://marshallcrosby.com
*/

(function ($) {
    'use strict';
    
    $.fn.renderSelectToDropdownElements = function (options) { 
        $(this).each(function() {
            var $select = $(this);
            var selectID = $select.attr('id');
            var selectLable = $('[for="' + selectID + '"]');
            var selectLableID = selectLable.attr('id');
                            
            // Setting defaults
            var settings = $.extend({
                'buttonClass': '',
                'extraOuterClass': '',
                'iconClass': '',
                'bootstrapDropdown': false,
                'bootstrapVersion': ''
            }, options);
            
            // Wrap in dropdown el
            $(this).wrap('<div class="select-default select-to-dropdown b-dropdown dropdown ' + settings.extraOuterClass + '"></div>');
            
            selectLable
                .siblings('.select-to-dropdown')
                .first()
                .prepend(selectLable);
            
            $('<button>')
                .addClass('toggle-btn ' + settings.buttonClass)
                .attr({
                    'type': 'button',
                    'id': selectID + '-toggle-btn',
                    'aria-haspopup': true,
                    'aria-expanded': false,
                    'aria-describedby': selectLableID
                })
                .insertAfter($(this).closest('.select-to-dropdown select'));
                
            if (settings.bootstrapDropdown === true) {
                var dataToggle = (settings.bootstrapVersion === '4') ? 'data-toggle' : 'data-bs-toggle'
                $select
                    .closest('.select-to-dropdown')
                    .find('.toggle-btn')
                    .attr(dataToggle, 'dropdown');    
            }
        
            $('<span>')
                .addClass('toggle-text')
                .appendTo($(this).closest('.select-to-dropdown').find('.toggle-btn'));
        
            $('<span>')
                .addClass('toggle-indicator ' + settings.iconClass)
                .attr('aria-hidden', true)
                .appendTo($(this).closest('.select-to-dropdown').find('.toggle-btn'));
        
            $('<div>')
                .addClass('dropdown-menu b-dropdown-menu p-0')
                .attr('aria-labelledby', selectID + '-toggle-btn')
                .appendTo($(this).closest('.select-to-dropdown'));
        });
    };
    
    $.fn.selectToDropdown = function () {   
        $(this).each(function(){
            var dropdownEl = $(this);
            var selectDropdownEl = dropdownEl.find('select');
            var placeHolderEl = dropdownEl.find('.toggle-text');
            var dropdownToggle = dropdownEl.find('.toggle-btn');
            var placeHolderText = (placeHolderEl.text() !== '') ? placeHolderEl.text() : selectDropdownEl.find('[value=""]').text();
            var dropdownMenu = dropdownEl.find('.b-dropdown-menu');
            
            $('<ul>').appendTo(dropdownMenu);
            
            // Build menu
            selectDropdownEl
                .attr('aria-hidden', 'true')
                .find('option').each(function () {
                    var $option = $(this);

                    var dropdownMenuOptionEntry = $('<button>')
                        .attr('type', 'button')
                        .addClass('b-dropdown-item dropdown-item')
                        .attr('data-value', $option.val())
                        .text($option.text());
                                            
                    if ($option.attr('disabled')) {
                        dropdownMenuOptionEntry
                            .addClass('disabled')
                            .prop('disabled', true);
                    }
                    
                    dropdownMenu
                        .find('ul')
                        .append(dropdownMenuOptionEntry);
                });
                
            // Wrap in li
            dropdownMenu
                .find('.b-dropdown-item')
                .each(function(){
                    $(this)
                        .wrap('<li>');
                });
            
            function updateMenuDisplay() {
                
                // Initial selected item class removal
                dropdownEl
                    .find('.js-item-selected')
                    .removeClass('js-item-selected');

                // Get selected option from select
                var selected = selectDropdownEl
                    .find('option')
                    .filter(function() {
                        return $(this).prop('selected');
                    });

                var selectedDropdownItem = dropdownEl.find('[data-value="' + selected.val() + '"]');

                // Set selected option text in toggle button
                if (selected.val() === '') {
                    placeHolderEl.html(placeHolderText);
                    dropdownToggle.removeClass('js-has-selected');
                } else {
                    selectedDropdownItem.addClass('js-item-selected');
                    dropdownToggle.addClass('js-has-selected');
                    placeHolderEl.html(selected.text() + ' <span class="sr-only">selected</span>');
                }
            }
            
            // Initial update
            updateMenuDisplay();

            dropdownEl.find('.b-dropdown-item').on('click', function(e) {
                e.preventDefault();

                var value = $(this).data('value');
                var eTarget = $(e.target);

                // Select the correct option
                dropdownEl
                    .find('option')
                    .prop('selected', false);

                var optionToSelect = dropdownEl.find('option').filter(function() {
                    return $(this).val().toString() === value.toString();
                });
                
                optionToSelect.prop('selected', true);

                // Update after click
                updateMenuDisplay();

                // Focus on dropdown toggle after selection is made
                dropdownToggle.focus();
                
                // Trigger change
                selectDropdownEl.trigger('change');
                
                // Close if using simple-dropdown.js
                if (eTarget.closest('.dropdown-menu').attr('data-toggle') !== 'dropdown') {
                    eTarget
                        .closest('.b-dropdown')
                        .removeClass('js-dropdown-active')
                        .end()
                        .closest('.b-dropdown')
                        .find('.b-dropdown-menu')
                        .removeClass('js-is-showing')
                        .end()
                        .closest('.b-dropdown')
                        .find('.toggle-btn')
                        .attr('aria-expanded', false);
                }
            });
            
            // Focus on first or selected item when dropdown is fired
            var shownHandler = (dropdownEl.find('[data-toggle="dropdown"]').length) ? 'shown.bs.dropdown' : 'shown.dropdown';
            dropdownEl.on(shownHandler, function() {
                var focusOnThisEl = (dropdownEl.find('.js-item-selected').length) ? dropdownEl.find('.js-item-selected') : dropdownEl.find('.b-dropdown-item').first();
                focusOnThisEl.focus();
            });

            // First letter type focus first on entry
            dropdownEl.on('keydown', function (e) {
                var $this = $(this);
                
                $this
                    .find('.b-dropdown-item')
                    .each(function() {
                        if ( $(this).text().charAt(0).toLowerCase() === String.fromCharCode(e.which).toLowerCase() ) {
                            $(this).focus();
                            return false;
                        }
                    });
            });            
        });
        
        $(window).trigger($.Event('select-to-dropdown.ready'));
    };

    $.fn.refreshSelectToDropdown = function() {
        $(this).each(function() {
            $(this)
                .find('.toggle-text')
                .html('')
                .end()
                .find('.b-dropdown-menu > *')
                .remove()
                .end()
                .selectToDropdown();
        });
    };
}(jQuery));
//# sourceMappingURL=bundle.js.map