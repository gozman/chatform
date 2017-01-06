$(document).ready(function() {

  // Place JavaScript code here...
  var formFields = JSON.parse(unescape($("#fieldData").val()));

  for(var i=0; i<formFields.length; i++) {
    var questionElement = $("<div class='question-panel'><a class='btn btn-remove pull-right'>Remove Question</a><textarea rows='2' cols='85' placeholder='Add your question here'>" + formFields[i].question + "</textarea><div class='quick-reply-field'><input type='text' class='reply-text' placeholder='Quick reply'/><a class='add-answer'>+</a><a class='remove-answer'>-</a></div></div>")

    //Add in any quick replies
    for(var j=0; j<formFields[i].answers.length; j++) {
      var lastReplyField = questionElement.find('.reply-text:last');
      lastReplyField.val(formFields[i].answers[j]);

      if( (j+1) != formFields[i].answers.length ) {
        $("<div class='quick-reply-field'><input type='text' class='reply-text' placeholder='Quick reply'/><a class='add-answer'>+</a><a class='remove-answer'>-</a></div>").insertAfter(lastReplyField.parent());
      }
    }

    if(i==0) {
      //First form field, insert after start trigger
      $(questionElement).insertAfter("#startMessage");
    } else {
      $(questionElement).insertAfter(".question-panel:last");
    }
  }

  $("#add_text_question").click(function() {
    console.log("Hello!@");
    var questionElement = "<div class='question-panel'><a class='btn btn-remove pull-right'>Remove Question</a><textarea rows='2' cols='85' placeholder='Add your question here'></textarea><div class='quick-reply-field'><input type='text' class='reply-text' placeholder='Quick reply'/><a class='add-answer'>+</a><a class='remove-answer'>-</a></div></div>"
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

  $('.right-column').on('click', '.add-answer', function(event) {
    $("<div class='quick-reply-field'><input type='text' class='reply-text' placeholder='Quick reply'/><a class='add-answer'>+</a><a class='remove-answer'>-</a></div>").insertAfter($(event.target).parent());
  });

  $('.right-column').on('click', '.remove-answer', function(event) {
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

      //Get quick reply buttons, if they exist
      var parent = $(this).parent();
      var qr = [];
      parent.find('.quick-reply-field').each(function(index) {
        var replyText = $(this).find('.reply-text').val();
        if(replyText) {
          qr.push(replyText);
        }
      });

      field.answers = qr;
      fields.push(field);
    });
    $("input[name='fields']").val(JSON.stringify(fields));

    $("form").submit();
  });
});
