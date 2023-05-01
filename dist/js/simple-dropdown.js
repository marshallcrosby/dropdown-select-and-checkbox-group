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