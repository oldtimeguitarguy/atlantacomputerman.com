// PRICING DATA [START]-------------------------
var pricing = {
	web_protect: 5,
	datasaver: {
		0: 0,
		10: 10,
		50: 20,
		100: 40,
		250: 95,
		500: 190,
		1000: 380
	},
	invincibility: 19,
	pc_guardian: 29,
	family_guardian: 99
};
// PRICING DATA [END]----------------------------

// Set up the variables	
var users = [];
var userID = 0;

// JQUERY DOCUMENT READY --------------
$(function() {

	// Load fonts ---------------------------
	WebFontConfig = {
	    google: { families: [ 'Oswald:700', 'Voltaire', 'Bangers' ]
	    },
	    active: webFontsLoaded
	  };
	  (function() {
	    var wf = document.createElement('script');
	    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
	      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	    wf.type = 'text/javascript';
	    wf.async = 'true';
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(wf, s);
	  })();

	// FONTS LOADED! DO STUFF!!!
	function webFontsLoaded() {
		$('.big-text').slabText();
	}

	// SKROLLR - init and disable on mobile
	if( $(window).width() > 767 ) {
		skrollr.init({
			forceHeight: false
		});
	}

	// Trigger modal when clicking quick support contact email link
	$('.quick-support-contact-box .email:parent, section.contact span.email:parent').click(function(e) {
		e.preventDefault();

		$('#quick-contact-modal').modal('show');
	});

	// Send Quick Contact Form
	$('form.quick-contact').submit(function(e) {
		e.preventDefault();
		
		// Serialize the form data
		var formData = $(this).serialize();

		// Start spinner
		$('.spinner').show();

		var thisForm = $(this)[0];

		// Post the form
		$.post('/quick-contact', formData, function(data) {
			// Hide the spinner
			$('.spinner').hide();
			
			// Close the modal
			$('#quick-contact-modal').modal('hide');

			// Clear the form
			thisForm.reset();
		});
	});

	// Send Contact Form
	$('form.contact').submit(function(e) {
		e.preventDefault();
		
		// Serialize the form data
		var formData = $(this).serialize();

		// Start spinner
		$('.spinner').show();

		var thisForm = $(this)[0];

		// Post the form
		$.post('/contact', formData, function(data) {
			// Hide the spinner
			$('.spinner').hide();

			// Clear the form
			thisForm.reset();
		});
	});

	// Phone number input mask
	$(".phone-input").mask("(999) 999-9999");

	// Zip code input mask
	$('.zip-code').mask('99999?-9999');

	// ADD / REMOVE COMPUTERS ---------------------
	$('section.sign-up #add-computer').click(function(e) {
		e.preventDefault();

		// Add a computer!
		$('section.sign-up ul.computer-list').append( $('.computer-list-item').html() );

		// Increase the number of computers in the input!
		var $input = $('section.sign-up #num-computers');
		var num = parseInt($input.val());
		num++;
		$input.val(num);

		calculatePricing();
	});
	$('section.sign-up #remove-computer').click(function(e) {
		e.preventDefault();

		var $input = $('section.sign-up #num-computers');
		var num = parseInt($input.val());

		// Make sure num > 1
		if ( num > 1 ) {
			// Remove the last computer in the list!
			$('section.sign-up ul.computer-list li:last').remove();

			// Decrease the number of computers in the input!			
			num--;
			$input.val(num);
		}

		calculatePricing();
	});
	$(document).on('click', 'section.sign-up ul.computer-list li button.close', function(e) {
		e.preventDefault();

		var $input = $('section.sign-up #num-computers');
		var num = parseInt($input.val());

		// Make sure num > 1
		if ( num > 1 ) {
			// Remove this computer from the list!
			$(this).parents('li').remove();

			// Decrease the number of computers in the input!			
			num--;
			$input.val(num);
		}

		calculatePricing();
	});

	// Add & Subtract GB
	$(document).on('click', 'section.sign-up ul.computer-list li .gb-data-computer .minus', function(e) {
		var $input = $(this).parents('.gb-data-computer').find('input');
		var num = parseInt($input.val());

		if ( num >= 5 ) {
			num-=5;
			$input.val(num);
		}

		calculatePricing();
	});
	$(document).on('click', 'section.sign-up ul.computer-list li .gb-data-computer .plus', function(e) {
		var $input = $(this).parents('.gb-data-computer').find('input');
		var num = parseInt($input.val());

		num+=5;
		$input.val(num);

		calculatePricing();
	});


	// ----------------------------------------- //
	// -------------- SIGN UP ------------------ //
	// ----------------------------------------- //	

	// Select computer type
	$(document).on('change', 'section.sign-up select.form-factor', function() {
		if ( $(this).val() == 'desktop' ) {
			$(this).prev('img').attr('src','/images/desktop.png');
		}
		else {
			$(this).prev('img').attr('src','/images/laptop.png');
		}
	});

	// Add user button
	$(document).on('click','section.sign-up button.add-user', function(e) {
		e.preventDefault();

		// Create li.user
		var li = $('<li />', { class: 'user' }).append( $('.select-user-template').html() );

		// Append li.user to ul.user-list
		$(this).prev('ul.user-list').append( li );

		// Fill the select with users
		var $select = li.find('select.user-select');
		for (var i = 0; i < users.length; i++) {
			$select.append('<option value="' + users[i].id + '">' + users[i].first + ' ' + users[i].last + '</option>');
		};

		// FINALLY - disable selected
		disableSelected( $select.parents('.user-list') );
	});

	// Show create user form if "CREATE USER" is selected - or if user is selected
	$(document).on('change', 'section.sign-up select.user-select', function() {
		// If CREATE USER is selected....
		if ( $(this).val() == 'create-new-user' ) {
			// Insert the template
			$(this).parents('.user').html( $('.create-user-template').html() );
			// Phone number input mask
			$(".phone-input").mask("(999) 999-9999");
		}
		else {
			// Another user was selected, so show the edit button!
			$(this).parents('table.user-select-table').find('button.edit-btn').show();

			// FINALLY - disable selected
			disableSelected( $(this).parents('.user-list') );
		}
	});

	// Remove the create user form if "Cancel" is pressed
	$(document).on('click', 'section.sign-up .button-area button.cancel-btn', function(e) {
		e.preventDefault();

		var $container = $(this).parents('.user');

		// Get user id
		var id = $container.find('input[name="id"]').val();

		// Show the user select
		$container.html( $('.select-user-template').html() );

		// Fill the select with users
		var $select = $container.find('select.user-select');
		for (var i = 0; i < users.length; i++) {
			$select.append('<option value="' + users[i].id + '">' + users[i].first + ' ' + users[i].last + '</option>');
		};		

		if ( id !== '') {
			// Select the previous user
			$select.children('[value="' + id + '"]').attr('selected','selected');

			// Show the edit button!	
			$select.parents('table.user-select-table').find('button.edit-btn').show();
		}

		// FINALLY - disable selected
		disableSelected( $select.parents('.user-list') );
	});

	// Remove the select user li if the x is pressed
	$(document).on('click', 'section.sign-up .btn-group button.cancel-btn', function(e) {
		e.preventDefault();

		var $userList = $(this).parents('.user-list');

		// Remove the li
		$(this).parents('.user').remove();

		disableSelected($userList);
	});

	// Create a user when the create button is clicked!
	$(document).on('submit', 'section.sign-up form.create-user', function(e) {
		e.preventDefault();

		// Grab form fields
		var fields = $(this).serializeArray();

		// Make sure all fields are filled
		var error = false;
		for (var i = fields.length - 1; i >= 0; i--) {
			// If one of them is empty...
			if ( fields[i].value == '' && fields[i].name != 'id' ) {
				// Show error in field
				$(this).children('[name="' + fields[i].name + '"]').parents('.form-group').addClass('has-error');
				// Set error to true
				error = true;
			}
		};		

		// Check to see if there was an error
		if (error) {
			// Display alert
			$(this).children('.alert').show();
		}
		else {
			// No errors! Create the user
			var user = {};
			for (var i = fields.length - 1; i >= 0; i--) {
				var key = fields[i].name;
				// Lowercase!
				var val = fields[i].value.toLowerCase();

				// If it's a part of a name, capitalize the first letter
				if ( key == 'first' || key == 'last' )
					val = val.charAt(0).toUpperCase() + val.slice(1);

				// Set the user!
				user[key] = val;
			};

			// Check to see if there is already a user with the same ID
			userExists = false;
			var n;
			for (n = users.length - 1; n >= 0; n--) {
				if ( user.id !== '' && users[n].id == user.id ) {
					userExists = true;
					break;
				}
			};

			// If the user exists, just update - otherwise create
			if ( userExists ) {
				// Set the user to the new info
				users[n] = user;

				// Now update all of the selects with the new user info
				var selects = $('section.sign-up').find('select.user-select');
				// Cycle through all selects
				for (var i = selects.length - 1; i >= 0; i--) {
					// Cycle through all options for this select
					var options = $(selects[i]).children();
					for (var m = options.length - 1; m >= 0; m--) {
						// If the option value matches the user, then update and break!
						if ( $(options[m]).val() == user.id ) {
							$(options[m]).text(user.first + ' ' + user.last);
							break;
						}
					};
				};
			}
			else {
				// Add the ID
				user.id = userID++;
				
				// Now push the user into the users var and save the userID
				users.push(user);

				// Now update all of the selects with the new user
				var selects = $('section.sign-up').find('select.user-select');
				for (var i = selects.length - 1; i >= 0; i--) {
					$(selects[i]).append('<option value="' + user.id + '">' + user.first + ' ' + user.last + '</option>');
				};
			}

			// Finally, return to the user select screen, with the new user selected
			var container = $(this).parents('.user');
			container.html( $('.select-user-template').html() );

			// Implant the users into the select box
			var $select = container.find('select.user-select');
			for (var i = 0; i < users.length; i++) {
				$select.append('<option value="' + users[i].id + '">' + users[i].first + ' ' + users[i].last + '</option>');
			};	

			// Select the user!
			$select.children('[value="' + user.id + '"]').attr('selected','selected');

			// Show the edit button!
			$select.parents('table.user-select-table').find('button.edit-btn').show();

			// FINALLY - disable selected
			disableSelected( container.parents('.user-list') );
		}		
	});

	// WHEN USER CLICKS "EDIT USER" button ------
	$(document).on('click', 'section.sign-up button.edit-btn', function(e) {
		e.preventDefault();

		// Select the user id matching the select value		
		var user;
		var id = $(this).parents('table.user-select-table').find('select.user-select').val();
		for (var i = users.length - 1; i >= 0; i--) {
			if ( users[i].id == id ) {
				user = users[i];
				break;
			}			
		};

		// Show the create user template
		var $container = $(this).parents('.user');
		$container.html( $('.create-user-template').html() );

		// Fill in the fields based on the user
		$container.find('input[name="id"]').val( user.id );
		$container.find('input[name="first"]').val( user.first );
		$container.find('input[name="last"]').val( user.last );
		$container.find('input[name="email"]').val( user.email );
		$container.find('input[name="phone"]').val( user.phone );
	});

	// This function disables selected options from other selects
	function disableSelected( $userList ) {
		// First undisable everything
		var disabled = $userList.find(':disabled');
		for (var i = disabled.length - 1; i >= 0; i--) {
			$(disabled[i]).prop('disabled',false);
		};

		// Loop through all selected
		var selected = $userList.find(':selected');
		for (var i = selected.length - 1; i >= 0; i--) {
			// Loop through all options
			var options = $userList.find('option');
			for (var n = options.length - 1; n >= 0; n--) {
				// Disable the matching option
				if ( $(options[n]).val() == $(selected[i]).val() )
					$(options[n]).prop('disabled',true);
			};

			// Enable this selected
			$(selected[i]).prop('disabled',false);
		};

		// Don't forget to re-disable all "select-option-label"s
		$userList.find('option.select-option-label').prop('disabled',true);
	}
	
});

// Update calculation when invincibility / web protect are selected
$(document).on('change', 'section.sign-up input[value="invincibility"], section.sign-up input[value="web-filtering"]', function() {
	calculatePricing();
});

function calculatePricing() {
	// Setup variables
	var numComputers 		 = 0,
			totalGB          = 0,
			numInvincibility = 0,
			numWebProtect    = 0;

	var numFamilyGuardian 					= 0,
			numFamilyGuardianWebProtect = 0,
			numPcGuardian               = 0,
			numInvincibileWebProtect    = 0,
			theInvincible               = null,
			dataPackage                 = 0,
			setupCost                   = 0,
			monthlyCost 								= 0;

	// Collect information
	numComputers     = parseInt( $('section.sign-up #num-computers').val() );
	theInvincible    = $('section.sign-up input[value="invincibility"]:checked');
	numInvincibility = theInvincible.length;
	numWebProtect    = $('section.sign-up input[value="web-filtering"]:checked').length;

	var gbAmountInput = $('section.sign-up .gb-amount');
	for (var i = gbAmountInput.length - 1; i >= 0; i--) {
		totalGB += parseInt($(gbAmountInput[i]).val());
	};

	// Invincibility computers are separate from all others, so remove invincibility from numComputers
	// TODO: IF INVICIBLE, NEED TO SEARCH AGAIN AND FIND OUT IF WEB PROTECT IS SELECTED WITH IT - IF SO, DON'T COUNT IT!!!
	numPcGuardian = numComputers - numInvincibility;

	// Now we need to figure out how many family guardians there are
	numFamilyGuardian = Math.floor( numPcGuardian / 4 );

	// Now that we have the number of family guardians, figure out pc guardians
	numPcGuardian %= 4;

	// Now we need to figure out Family Guardian + Web Protect
	if ( numWebProtect > 3 ) {
		// Go through each invincible
		for (var i = theInvincible.length - 1; i >= 0; i--) {
			// Determine if its neighborhood web protect is checked & if so, add one to numInvincibileWebProtect & subtract from the other
			numInvincibileWebProtect += $(theInvincible[i]).parents('.right').find('input[value="web-filtering"]:checked').length;
		};

		// Fix the numWebProtect
		numWebProtect -= numInvincibileWebProtect;

		// Now calculate the number for family guardian web protects
		numFamilyGuardianWebProtect = Math.floor(numWebProtect / 4);
		numWebProtect %= 4;
		if ( numFamilyGuardian >= numFamilyGuardianWebProtect ) {
			numFamilyGuardian -= numFamilyGuardianWebProtect;
		}
	}

	// Calculate the data package
	if ( totalGB > 500 ) {
		dataPackage = 1000;
	}
	else if ( totalGB > 250 ) {
		dataPackage = 500;
	}
	else if ( totalGB > 100 ) {
		dataPackage = 250;
	}
	else if ( totalGB > 50 ) {
		dataPackage = 100;
	}
	else if ( totalGB > 10 ) {
		dataPackage = 50;
	}
	else if ( totalGB > 0 ) {
		dataPackage = 10;
	}

	// Calculate the final price
	monthlyCost = pricing.datasaver[dataPackage]
							+ (numWebProtect + numInvincibileWebProtect) * pricing.web_protect
							+ numFamilyGuardian * pricing.family_guardian
							+ numPcGuardian * pricing.pc_guardian
							+ numFamilyGuardianWebProtect * pricing.family_guardian
							+ numInvincibility * pricing.invincibility;

	// NOW EVERYTHING HAS BEEN CALCULATED! TIME FOR THE DISPLAY!
	var $estimate_table = $('section.sign-up table.estimate');
	var $estimate_body = $estimate_table.children('tbody');

	var family_guardian_web_protect_template = $('.estimate-line-fgwp').html();
	var family_guardian_template = $('.estimate-line-fg').html();
	var pc_guardian_template = $('.estimate-line-pg').html();
	var pc_invincibility_template = $('.estimate-line-pi').html();
	var web_protect_template = $('.estimate-line-wp').html();
	var datasaver_template = $('.estimate-line-ds').html();
	
	// Clear the estimate
	$estimate_body.html('');

	// Family Guardian + Web Protect
	if ( numFamilyGuardianWebProtect > 0 ) {
		$estimate_body.append(family_guardian_web_protect_template);
		$estimate_body.find('.family-guardian-web-protect .quantity').text( numFamilyGuardianWebProtect );
	}
	// Family Guardian
	if ( numFamilyGuardian > 0 ) {
		$estimate_body.append(family_guardian_template);
		$estimate_body.find('.family-guardian .quantity').text( numFamilyGuardian );
	}
	// PC Guardian
	if ( numPcGuardian > 0 ) {
		$estimate_body.append(pc_guardian_template);
		$estimate_body.find('.pc-guardian .quantity').text( numPcGuardian );
	}
	// Invincibility
	if ( numInvincibility > 0 ) {
		$estimate_body.append(pc_invincibility_template);
		$estimate_body.find('.pc-invincibility .quantity').text( numInvincibility );
	}
	// Web Protect
	if ( (numWebProtect + numInvincibileWebProtect) > 0 ) {
		$estimate_body.append(web_protect_template);
		$estimate_body.find('.web-protect .quantity').text( (numWebProtect + numInvincibileWebProtect) );
	}
	// Datasaver
	if ( dataPackage > 0 ) {
		$estimate_body.append(datasaver_template);
		$estimate_body.find('.datasaver .quantity').text( dataPackage );
	}

	// Update final price
	$estimate_table.find('.final-price').html( '$'+monthlyCost+'<small>/mo</small>' );

	// Update due today
	$estimate_table.find('.due-today').text( '$' + (monthlyCost+setupCost) );
}