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
                var dataToggle = (settings.bootstrapVersion === '5') ? 'data-bs-toggle' : 'data-toggle'
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