$(document).ready(() => {

    $.ajax({
        url: '/api/events/all',
        method: 'GET',
        success: (dates) => {
            for (var i in dates) dates[i].date = new Date(dates[i].date)
            $('#event_calendar').attr('class', 'ui calendar')
            $('#event_calendar').calendar({
                selectAdjacentDays: true,
                initialDate: new Date(),
                type: 'date',
                today: true,
                constantHeight: true,
                firstDayOfWeek: 1,
                eventDates: dates,
                onChange: () => $('#event_calendar').trigger('change')
            })
            $('#event_calendar').ready(() => $('#event_calendar').trigger('change'))
        }
    })

    $('#event_calendar').on('input change', () => {
        const calendar = $('#event_calendar')
        const list = $('#event_list')

        list.attr('class', 'ui loading placeholder segment')
        $.ajax({
            url: '/api/events/day',
            method: 'POST',
            data: { date: calendar.calendar('get date').toISOString() },
            success: (events) => {
                if (events.length == 0) {
                    list.attr('class', 'ui placeholder segment')
                    list.html('<div class="ui icon header"><i class="calendar alternate icon"></i>There are currently no events planed on this day!</div>')
                } else {
                    list.attr('class', 'ui items')
                    list.html('')
                    for (var event of events) {
                        list.append($(`
                        <a class="ui fluid link card" href="/trip/${event.tripId}" target="_blank">
                            <div class="content">
                                <div class="header">
                                    <div class="ui left floated">${event.tripName}</div>
                                    <div class="ui right floated">Level: ${event.skillLevel}</div>
                                </div>
                            </div>
                        </a>
                        `))
                    }
                }
            },
            error: () => {
                list.attr('class', 'ui placeholder segment')
                list.html('<div class="ui icon header"><i class="red server icon"></i>There was a problem reaching the server. Try again later!</div>')
            }
        })
    })
})