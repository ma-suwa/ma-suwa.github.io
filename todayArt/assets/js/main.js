$(function(){

  //スライドショー
  $('#slideshow .slideBox').slick({
   dots: true,
   infinit: true,
   slidesToShow: 1,
   slidesToScroll: 3,
   autoplay: true,
   arrows: false,
   pauseOnHover: true,
   swipe: true,
   centerMode: true,
   centerPadding: '0px',
   variableWidth: true,
   responsive: [
     {
       breakpoint: 750,
       settings: {
         centerPadding: '100px',
         slidesToShow: 1,
         slidesToScroll: 1,
         infinit: false
       }
     }
    ]
  });

  //タブ切り替え
  $('.tabs ul a').on('click', function(){
    $(this).blur();

    $('.tabs ul a').removeClass('selected');
    $(this).addClass('selected');

    var target = $(this).attr('href');
    $('.contents > div').hide();
    $(target).show();

    return false;
  });

});
