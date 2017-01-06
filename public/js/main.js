$(document).ready(function() {

  // Place JavaScript code here...
  var formFields = JSON.parse(unescape($("#fieldData").val()));

  for(var i=0; i<formFields.length; i++) {
    var questionElement = "<div class='question-panel'><a class='btn btn-remove pull-right'>Remove Question</a><textarea rows='2' cols='85' placeholder='Add your question here'>" + formFields[i].question + "</textarea>"
    if(i==0) {
      //First form field, insert after start trigger
      $(questionElement).insertAfter("#startMessage");
    } else {
      $(questionElement).insertAfter(".question-panel:last");
    }
  }

  $("#add_text_question").click(function() {
    console.log("Hello!@");
    var questionElement = "<div class='question-panel'><a class='btn btn-remove pull-right'>Remove Question</a><textarea rows='2' cols='85' placeholder='Add your question here'></textarea>"
    if($('.question-panel').length) {
      $(questionElement).insertAfter(".question-panel:last");
    } else {
      $(questionElement).insertAfter("#startMessage");
    }
  });

  $('.right-column').on('click', '.btn-remove', function(event) {
    var par = $(event.target).parent();
    par.remove();
  });

  $('#submit-form').click(function(event) {
    $("input[name='name']").val($("#name").val());
    $("input[name='startTrigger']").val($("#startTrigger").val());
    $("input[name='startMessage']").val($("#startMessage").val());
    $("input[name='endMessage']").val($("#endMessage").val());

    var fields = [];
    //Build fields from questions
    $("textarea").each(function(index) {
      var field = {
        question: $(this).val(),
        type: 'text'
      }

      fields.push(field);
    });
    $("input[name='fields']").val(JSON.stringify(fields));

    $("form").submit();
  });
});
