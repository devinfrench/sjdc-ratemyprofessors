// This block automatically executes after the page is finished loading
var professors = new Array();
var parent_fieldset = document.getElementsByTagName('fieldset');
if (parent_fieldset.length > 0) {
    var child_fieldsets = parent_fieldset[0].getElementsByTagName('fieldset');
    for (var i = 0; i < child_fieldsets.length; i++) {
        var td = child_fieldsets[i].getElementsByTagName('td');
        if (td.length >= 5) {
            var professor = td[4].innerHTML;
            if (professors.indexOf(professor) < 0) {
                professors.push(professor);
            }
        }
    }
    for (var i = 0; i < professors.length; i++) {
        displayRating(professors[i]);
    }
}

/**
 * Wrapper function to display the professor's rating in the course listings
 *
 * @param professor
 */
function displayRating(professor) {
    console.log(professor);
    getTID(professor);
}

/**
 * Performs a search on ratemyprofessor to get the professor's tid
 *
 * @param professor
 */
function getTID(professor) {
    var last_name = professor.substring(0, professor.indexOf(','));
    if (last_name.indexOf(' ') > -1) {
        last_name = last_name.substring(0, last_name.indexOf(' '));
    }
    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: 'http://www.ratemyprofessors.com/search.jsp',
        data : 'queryBy=teacherName&schoolName=san+joaquin+delta+college&queryoption=HEADER&query='+last_name+'&facetSearch=true'
    }, function (response) {
        var start_index = response.indexOf('<li class="listing PROFESSOR">');
        var end_index = response.indexOf('</li>', start_index) + 4;
        var text = response.substring(start_index, end_index);
        start_index = text.indexOf('tid=') + 4;
        end_index = text.indexOf('"', start_index);
        var tid = text.substring(start_index, end_index);
        getRating(professor, tid, last_name);
        console.log(tid);
    });
}

/**
 * Gets the professor's overall rating from ratemyprofessor
 *
 * @param professor
 * @param tid
 * @param last_name
 */
function getRating(professor, tid, last_name) {
    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: 'http://www.ratemyprofessors.com/ShowRatings.jsp',
        data: 'tid=' + tid
    }, function (response) {
        var start_index = response.indexOf('<div class="grade">') + 19;
        var end_index = response.indexOf('</div>', start_index);
        var rating = response.substring(start_index, end_index);
        appendRating(professor, rating, last_name);
        console.log(rating);
    });
}

/**
 * Adds the rating to the course listings page
 *
 * @param professor
 * @param rating
 * @param last_name
 */
function appendRating(professor, rating, last_name) {
    var parent_fieldset = document.getElementsByTagName('fieldset');
    if (parent_fieldset.length > 0) {
        var child_fieldsets = parent_fieldset[0].getElementsByTagName('fieldset');
        for (var i = 0; i < child_fieldsets.length; i++) {
            var td = child_fieldsets[i].getElementsByTagName('td');
            if (td.length >= 5) {
                var name = td[4].innerHTML;
                if (name.indexOf(professor) > -1) {
                    if (rating.length < 4) {
                        if (Number(rating) >= 4.0) {
                            td[4].innerHTML = '<span style="color: #B2CF35">' + professor
                            + '</span> <a target="_blank" href="http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=san+joaquin+delta+college&queryoption=HEADER&query='
                            + last_name + '&facetSearch=true">' + rating + '</a>';
                        } else if (Number(rating) >= 3.0) {
                            td[4].innerHTML = '<span style="color: #F7CC1E">' + professor
                            + '</span> <a target="_blank" href="http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=san+joaquin+delta+college&queryoption=HEADER&query='
                            + last_name + '&facetSearch=true">' + rating + '</a>';
                        } else {
                            td[4].innerHTML = '<span style="color: #E21744">' + professor
                            + '</span> <a target="_blank" href="http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=san+joaquin+delta+college&queryoption=HEADER&query='
                            + last_name + '&facetSearch=true">' + rating + '</a>';
                        }
                    } else {
                        td[4].innerHTML = professor + ' 0.0';
                    }
                }
            }
        }
    }
}
