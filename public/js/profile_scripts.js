$(document).ready(() => {

    // Code for the settings menu
    $('.tabular.menu .item').tab()

    $('#personal').on('click', () => {
        $('#personal').addClass('active')
        $('#customize').removeClass('active')
        $('#password').removeClass('active')
        $.tab('change tab', 'personal')
    })

    $('#customize').on('click', () => {
        $('#customize').addClass('active')
        $('#personal').removeClass('active')
        $('#password').removeClass('active')
        $.tab('change tab', 'customize')
    })

    $('#password').on('click', () => {
        $('#password').addClass('active')
        $('#customize').removeClass('active')
        $('#personal').removeClass('active')
        $.tab('change tab', 'password')
    })

    $.ajax({
        url: '/api/bookings/dates',
        method: 'GET',
        success: (dates) => {
            for (var i in dates) dates[i].date = new Date(dates[i].date)
            $('#bookings_calendar').attr('class', 'ui calendar')
            $('#bookings_calendar').calendar({
                selectAdjacentDays: true,
                initialDate: new Date(),
                type: 'date',
                today: true,
                constantHeight: true,
                firstDayOfWeek: 1,
                eventDates: dates,
                onChange: () => $('#bookings_calendar').trigger('change')
            })
            $('#bookings_calendar').ready(() => $('#bookings_calendar').trigger('change'))
        }
    })

    $('#bookings_calendar').on('input change', () => {
        const calendar = $('#bookings_calendar')
        const list = $('#bookings_list')

        list.html('')
        list.attr('class', 'ui loading placeholder segment')
        $.ajax({
            url: '/api/bookings/day',
            method: 'POST',
            data: { date: calendar.calendar('get date').toISOString() },
            success: (bookings) => {
                if (bookings.length == 0) {
                    list.attr('class', 'ui placeholder segment')
                    list.html('')
                    list.html('<div class="ui icon header"><i class="calendar alternate icon"></i>You have no bookings for this day!</div>')
                } else {
                    list.html('')
                    list.attr('class', 'ui items')
                    for (var booking of bookings) {
                        list.append($(`<div class="ui fluid card" id="${booking.bookingId}"></div>`)
                            .append($(`<div class="content"></div>`)
                                .append($(`<div class="ui right floated negative icon button"><i class="ui trash icon"></i></div>`).on('click', function () {
                                    const button = $(this)
                                    $.ajax({
                                        url: '/api/bookings/delete',
                                        method: 'POST',
                                        data: { bookingId: button.parent().parent().attr('id') },
                                        success: () => { button.parent().parent().remove() }
                                    })
                                }))
                                .append($(`<div class="header" style="margin-top: 6px"><div class="ui left floated">${booking.fromDate.substring(0, 10)} to ${booking.toDate.substring(0, 10)} - ${booking.equipment.type}:</div><div class="ui right floated" style="padding-right: 15px">${booking.equipment.brand}: ${booking.equipment.gearName}</div></div>`))
                            )
                        )
                    }
                }
            },
            error: () => {
                list.attr('class', 'ui placeholder segment')
                list.html('<div class="ui icon header"><i class="red server icon"></i>There was a problem reaching the server. Try again later!</div>')
            }
        })
    })





    // Event handlers for the personal form
    $('#personal_form').submit((event) => {
        event.preventDefault()
        const form = $('#personal_form')
        const inputs = $("form#personal_form input[type != button][class != search]")
        var valid = true

        inputs.trigger('change')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.attr('class', 'ui loading form')
            var data = {}
            inputs.each((index, element) => {
                var input = $(element)
                data[input.attr('id')] = input.val()
            })
            $.ajax({
                url: '/api/profile/pesonal/update',
                method: 'POST',
                data: data,
                success: () => form.attr('class', 'ui success form'),
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#firstName').on('input change', () => {
        const name = $('#firstName')
        const field = name.parent()
        if (!name.val().match(/^['-\.\p{L}]{1,16}$/u)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#lastName').on('input change', () => {
        const name = $('#lastName')
        const field = name.parent()
        if (!name.val().match(/^['-\.\p{L}]{1,16}$/u)) {
            field.attr('class', 'field error')
            name.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            name.prop('valid', true)
        }
    })

    $('#email').on('input change', () => {
        const email = $('#email')
        const field = email.parent()
        if (!email.val().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) {
            field.attr('class', 'field error')
            email.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            email.prop('valid', true)
        }
    })

    $('#phone').on('input change', () => {
        const phone = $('#phone')
        const field = phone.parent()
        if (phone.val() == '') {
            field.attr('class', 'field')
            phone.prop('valid', true)
        } else if (!phone.val().match(/^[+0]+\d{8,12}$/)) {
            field.attr('class', 'field error')
            phone.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            phone.prop('valid', true)
        }
    })

    $('#verify_link').on('click', () => {
        const text = $('#verify_link').parent()
        text.append('<div class="ui active inline tiny loader"></div>')
        $.ajax({
            url: '/api/profile/verify',
            method: 'GET',
            success: () => {
                text.html()
                text.text('Verification Requested!')
            },
            error: () => {
                text.html('There was an issue, please try again later!')
            }
        })
    })

    $('#lineOne').on('input change', () => {
        const line = $('#lineOne')
        const field = line.parent()
        if (!line.val().match(/^[\w-\.,' ]{1,32}$/)) {
            field.attr('class', 'field error')
            line.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            line.prop('valid', true)
        }
    })

    $('#lineTwo').on('input change', () => {
        const line = $('#lineTwo')
        const field = line.parent()
        if (line.val() == '') {
            field.attr('class', 'field')
            line.prop('valid', true)
        } else if (!line.val().match(/^[\w-\.,' ]{1,32}$/)) {
            field.attr('class', 'field error')
            line.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            line.prop('valid', true)
        }
    })

    $('#city').on('input change', () => {
        const city = $('#city')
        const field = city.parent()
        if (!city.val().match(/^[\w- ]{1,32}$/)) {
            field.attr('class', 'field error')
            city.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            city.prop('valid', true)
        }
    })

    $('#county_dropdown').dropdown()
    $('#county').on('input change', () => {
        const county = $('#county')
        const field = county.parent().parent()
        var counties = [
            'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
            'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
            'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
            'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
        ]

        if (!counties.includes(county.val())) {
            field.attr('class', 'ten wide field error')
            county.prop('valid', false)
        } else {
            field.attr('class', 'ten wide field success')
            county.prop('valid', true)
        }
    })

    $('#code').on('input change', () => {
        const code = $('#code')
        const field = code.parent()
        if (!code.val().match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !code.val().match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) {
            field.attr('class', 'six wide field error')
            code.prop('valid', false)
        } else {
            field.attr('class', 'six wide field success')
            code.prop('valid', true)
        }
    })

    $('#promotion').on('input change', () => {
        const box = $('#promotion')

        if (!box.prop('checked')) {
            box.siblings().text('You will not receive promotional material about club events!')
            box.val(false)
        } else {
            box.siblings().text('Occasionally you will receive promotional material about upcoming events!')
            box.val(true)
        }
        box.prop('valid', true)
    })
    $('#promotion').trigger('change')

    $('#prompt_delete').click(() => $('#modal').modal('show'))
    $('#cancel').click(() => $('#modal').modal('hide'))
    $('#delete').click(() => {
        $('#modal').modal('hide')
        $('#personal_form').attr('class', 'ui loading form')
        $.ajax({
            url: '/api/profile/delete',
            method: 'GET',
            success: () => window.location = '/home',
            error: () => {
                $('#modal').modal('show')
                $('#personal_form').attr('class', 'ui form')
                $('#modal_error').show()
            }
        })
    })





    // Event handlers for the customize form
    $('#customize_form').submit((event) => {
        event.preventDefault()
        const form = $('#customize_form')
        const file = $('#file')
        const inputs = $("form#customize_form input[type = file], form#customize_form textarea")

        var valid = true
        inputs.trigger('change')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.attr('class', 'ui loading form')
            var data = new FormData()

            if (file.prop('files')[0] != undefined) data.append('file', file[0].files[0])
            data.append('bio', $('#bio').val())

            $.ajax({
                url: '/api/profile/settings/update',
                method: 'POST',
                contentType: false,
                processData: false,
                enctype: 'multipart/form-data',
                data: data,
                success: (res) => {
                    form.attr('class', 'ui success form')
                    $('#image').attr('src', res.url)
                },
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#bio').on('input change', () => {
        const bio = $('#bio')
        const field = bio.parent()

        if (bio.val() == '') {
            field.attr('class', 'field')
            bio.prop('valid', true)
        } else if (!bio.val().match(/^[^<>]{1,500}$/u)) {
            field.attr('class', 'error field')
            bio.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            bio.prop('valid', true)
        }
    })

    $('#file').on('input change', () => {
        const file = $('#file')
        const field = file.parent()

        if (file.prop('files')[0] == undefined) {
            field.attr('class', 'field')
            file.prop('valid', true)
        } else if (file.prop('files')[0].type.split('/')[0] != 'image') {
            field.attr('class', 'error field')
            file.prop('valid', false)
        } else {
            field.attr('class', 'success field')
            file.prop('valid', true)
        }
    })





    // Event handlers for the password form
    $('#password_form').submit((event) => {
        event.preventDefault()
        const form = $('#password_form')
        const inputs = $("form#password_form input[type=password]")
        var valid = true

        inputs.trigger('change')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.addClass('loading')
            var data = {}
            inputs.each((index, element) => {
                var input = $(element)
                data[input.attr('id')] = input.val()
            })
            $.ajax({
                url: '/api/profile/password/update',
                method: 'POST',
                data: data,
                success: () => {
                    form.attr('class', 'ui success form')
                    inputs.each((index, element) => $(element).val(''))
                },
                error: () => {
                    form.attr('class', 'ui error form')
                    inputs.each((index, element) => $(element).val(''))
                }
            })
        }
    })

    $('#old_password').on('input change', () => {
        const password = $('#old_password')

        if (password.val() == '') {
            password.parent().parent().addClass('error')
            password.prop('valid', false)
        } else {
            password.parent().parent().removeClass('error')
            password.prop('valid', true)
        }
    })

    $('#new_password').on('input change', () => {
        const password = $('#new_password')
        const field = password.parent().parent()
        const form = field.parent()
        const res = zxcvbn(password.val())

        var warn = 'Your password is weak!'
        var tips = ''

        if (password.val() == '') {
            password.prop('valid', false)
            field.attr('class', 'error field')
            form.attr('class', 'ui form')
        } else if (res.score < 3) {
            password.prop('valid', false)
            field.attr('class', 'error field')
            form.attr('class', 'ui warning form')

            // Build and set warning message
            if (res.feedback.warning != '') warn = `${warn} ${res.feedback.warning}:`
            $('#password_warning_header').text(warn)
            for (suggestion of res.feedback.suggestions) tips = `${tips} ${suggestion}<br style="padding: 0px 10px">`
            $('#password_warning').html(tips)
        } else if (res.score < 4) {
            password.prop('valid', true)
            field.attr('class', 'info field')
            form.attr('class', 'ui info form')
        } else if (res.score == 4) {
            password.prop('valid', true)
            field.attr('class', 'success field')
            form.attr('class', 'ui form')
        } else {
            password.prop('valid', false)
            field.attr('class', 'info field')
            form.attr('class', 'ui form')
        }
    })

    $('#confirm_password').on('input change', () => {
        const confirm_password = $('#confirm_password')

        if (confirm_password.val() != $('#new_password').val() || confirm_password.val() == '') {
            confirm_password.parent().attr('class', 'error field')
            confirm_password.prop('valid', false)
        } else {
            confirm_password.parent().attr('class', 'success field')
            confirm_password.prop('valid', true)
        }
    })

    $('#hide_old_password').on('focus', () => $('#new_password').focus())
    $('#hide_old_password').click(() => {
        const password = $('#old_password')

        if (password.attr('type') == 'password') {
            password.attr('type', 'text')
            password.siblings().attr('class', 'eye icon')

        } else {
            password.attr('type', 'password')
            password.siblings().attr('class', 'eye slash icon')
        }
        password.focus()
    })

    $('#hide_new_password').on('focus', () => $('#confirm_password').focus())
    $('#hide_new_password').click(() => {
        const password = $('#new_password')
        const confirm = $('#confirm_password')

        if (password.attr('type') == 'password') {
            password.attr('type', 'text')
            confirm.attr('disabled', true)
            password.siblings().attr('class', 'eye icon')

        } else {
            password.attr('type', 'password')
            confirm.attr('disabled', false)
            password.siblings().attr('class', 'eye slash icon')
        }
        password.focus()
    })
})