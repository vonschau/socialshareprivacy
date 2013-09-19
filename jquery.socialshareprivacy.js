/*
 * jquery.socialshareprivacy.js
 *
 * https://github.com/vonschau/socialshareprivacy
 * https://github.com/patrickheck/socialshareprivacy
 * http://www.heise.de/ct/artikel/2-Klicks-fuer-mehr-Datenschutz-1333879.html
 *
 * Copyright (c) 2011 Hilko Holweg, Sebastian Hilbig, Nicolas Heiringhoff, Juergen Schmidt
 * Heise Zeitschriften Verlag GmbH & Co. KG, http://www.heise.de,
 *
 * Copyright (c) 2011 Tilmann Kuhn
 * object-zoo, http://www.object-zoo.net
 *
 * Copyright (c) 2013 Martin Cajthaml
 * SYMBIO Digital, http://www.symbiodigital.com
 *
 * is released under the MIT License http://www.opensource.org/licenses/mit-license.php
 *
 */
 (function ($) {

    "use strict";

    /*
     * helper functions
     */

    // abbreviate at last blank before length and add "\u2026" (horizontal ellipsis)
    function abbreviateText(text, length) {
        var abbreviated = decodeURIComponent(text);
        if (abbreviated.length <= length) {
            return text;
        }

        var lastWhitespaceIndex = abbreviated.substring(0, length - 1).lastIndexOf(' ');
        abbreviated = encodeURIComponent(abbreviated.substring(0, lastWhitespaceIndex)) + "\u2026";

        return abbreviated;
    }

    // returns content of <meta name="" content=""> tags or '' if empty/non existant
    function getMeta(name) {
        var metaContent = $('meta[name="' + name + '"]').attr('content');
        return metaContent || '';
    }

    // create tweet text from content of <meta name="DC.title"> and <meta name="DC.creator">
    // fallback to content of <title> tag
    function getTweetText() {
        var title = getMeta('DC.title');
        var creator = getMeta('DC.creator');

        if (title.length > 0 && creator.length > 0) {
            title += ' - ' + creator;
        } else {
            title = $('title').text();
        }

        return encodeURIComponent(title);
    }

    // build URI from rel="canonical" or document.location
    function getURI() {
        var uri = document.location.href;
        var canonical = $("link[rel=canonical]").attr("href");

        if (canonical && canonical.length > 0) {
            if (canonical.indexOf("http") < 0) {
                canonical = document.location.protocol + "//" + document.location.host + canonical;
            }
            uri = canonical;
        }

        return uri;
    }

    // extend jquery with our plugin function
    $.fn.socialSharePrivacy = function (settings) {
        var defaults = {
            services:       {
                facebook: {
                    status:         'on',
                    dummy_img:      '',
                    display_name:   'Facebook',
                    referrer_track: '',
                    language:       'en_US',
                    action:         'like',
                    dummy_caption:  'Activate like button',
                    dummy_styles: {
                        'background': '#eeeeee',
                        'border-radius': '3px',
                        'border': '1px solid #cacaca',
                        'color': '#666666',
                        'cursor': 'pointer',
                        'font-family': 'lucida grande,tahoma,verdana,arial,sans-serif',
                        'font-size': '11px',
                        'height': '20px',
                        'padding': '0 5px 2px 5px',
                        'white-space': 'nowrap',
                        'width': '145px'
                    }
                },
                twitter:  {
                    status:          'on',
                    dummy_img:       '',
                    dummy_caption:   'Activate follow button',
                    display_name:    'Follow',
                    referrer_track:  '',
                    tweet_text:      getTweetText,
                    language:        'en',
                    dummy_styles: {
                        'background': '#eeeeee',
                        'border-radius': '3px',
                        'border': '1px solid #cacaca',
                        'color': '#666666',
                        'cursor': 'pointer',
                        'font-family': 'lucida grande,tahoma,verdana,arial,sans-serif',
                        'font-size': '11px',
                        'height': '20px',
                        'padding': '0 5px 2px 5px',
                        'white-space': 'nowrap',
                        'width': '145px'
                    }
                },
                gplus:    {
                    status:         'on',
                    dummy_img:      '',
                    dummy_caption:   'Activate g+ button',
                    display_name:   'Google+',
                    referrer_track: '',
                    language:       'en'
                }
            },
            uri:            getURI
        };

        // Standardwerte des Plug-Ings mit den vom User angegebenen Optionen ueberschreiben
        var options = $.extend(true, defaults, settings);

        var facebook_on = (options.services.facebook.status === 'on');
        var twitter_on = (options.services.twitter.status === 'on');
        var gplus_on = (options.services.gplus.status === 'on');

        // check if at least one service is "on"
        if (!facebook_on && !twitter_on && !gplus_on) {
            return;
        }

        return this.each(function () {

            $(this).prepend('<ul class="social_share_privacy_area"></ul>');
            var context = $('.social_share_privacy_area', this);

            // canonical uri that will be shared
            var uri = options.uri;
            if (typeof uri === 'function') {
                uri = uri(context);
            }

            //
            // Facebook
            //
            if (facebook_on) {
                var fb_enc_uri = encodeURIComponent($(this).data('href') + options.services.facebook.referrer_track);
                var fb_code = '<iframe src="http://www.facebook.com/plugins/like.php?locale=' +
                options.services.facebook.language + '&amp;href=' + fb_enc_uri +
                '&amp;send=false&amp;layout=button_count&amp;width=120&amp;show_faces=false&amp;action=' +
                options.services.facebook.action +
                '&amp;colorscheme=light&amp;font&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:145px; height:21px;" allowTransparency="true"></iframe>';
                var fb_dummy_btn;
                if (options.services.facebook.dummy_img) {
                    fb_dummy_btn = '<img class="fb_like_privacy_dummy" src="' + options.services.facebook.dummy_img + '" alt="' + options.services.facebook.dummy_caption + '" />';
                }
                else {
                    fb_dummy_btn = '<div class="fb_like_privacy_dummy"><i style="width:14px;height:14px;margin:2px 3px 0 0;display:inline-block;background:url(http://static.ak.fbcdn.net/rsrc.php/v2/y-/r/tbhIfdAHjXE.png) no-repeat 0 -15px"></i><span style="display:inline-block;vertical-align:top;height:13px;line-height:17px">' + options.services.facebook.dummy_caption + '</span></div>';
                }
                context.append('<li class="facebook help_info"><div class="fb_like dummy_btn">' + fb_dummy_btn + '</div></li>');

                var $container_fb = $('li.facebook', context);

                var $dummy_btn = $('.fb_like_privacy_dummy', context);
                $dummy_btn.css(options.services.facebook.dummy_styles)

                context.on('click', 'li.facebook div.fb_like .fb_like_privacy_dummy', function () {
                    $container_fb.find('.fb_like_privacy_dummy').replaceWith(fb_code);
                });
            }

            //
            // Twitter
            //
            if (twitter_on) {
                var text = options.services.twitter.tweet_text;
                if (typeof text === 'function') {
                    text = text();
                }
                // 120 is the max character count left after twitters automatic url shortening with t.co
                text = abbreviateText(text, '120');

                var twitter_code = '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="https://platform.twitter.com/widgets/follow_button.html?lang=' + options.services.twitter.language + '&screen_name=' + $(this).data('account') + '&show_count=true&show_screen_name=true&size=m" style="width:130px; height:25px;"></iframe>';
                var twitter_dummy_btn;
                if (options.services.twitter.dummy_img) {
                    twitter_dummy_btn =
                    '<img class="tweet_this_dummy" src="' + options.services.twitter.dummy_img + '" alt="' +
                    options.services.twitter.dummy_caption + '" />';
                }
                else {
                    twitter_dummy_btn =
                    '<div class="tweet_this_dummy"><span>' + options.services.twitter.dummy_caption +
                    '</span></div>';
                }

                context.append('<li class="twitter help_info"><div class="tweet dummy_btn">' + twitter_dummy_btn + '</div></li>');

                var $container_tw = $('li.twitter', context);

                var $dummy_btn = $('.tweet_this_dummy', context);
                $dummy_btn.css(options.services.twitter.dummy_styles)

                context.on('click', 'li.twitter .tweet_this_dummy,li.twitter span.switch', function () {
                    $container_tw.find('.tweet_this_dummy').replaceWith(twitter_code);
                });
            }

            //
            // Google+
            //
            if (gplus_on) {
                // fuer G+ wird die URL nicht encoded, da das zu einem Fehler fuehrt
                var gplus_uri = uri + options.services.gplus.referrer_track;

                // we use the Google+ "asynchronous" code, standard code is flaky if inserted into dom after load
                var gplus_code = '<div class="g-plusone" data-size="medium" data-href="' + gplus_uri +
                '"></div><script type="text/javascript">window.___gcfg = {lang: "' +
                options.services.gplus.language +
                '"}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; po.src = "https://apis.google.com/js/plusone.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>';
                var gplus_dummy_btn
                if (options.services.gplus.dummy_img) {
                    gplus_dummy_btn =
                    '<img src="' + options.services.gplus.dummy_img + '" alt="+1" class="gplus_one_dummy" />';
                } else {
                    gplus_dummy_btn = '<div class="gplus_one_dummy">+1</div>';
                }
                context.append('<li class="gplus help_info"><div class="gplusone dummy_btn">' + gplus_dummy_btn + '</div></li>');

                var $container_gplus = $('li.gplus', context);

                context.on('click', 'li.gplus div.gplusone .gplus_one_dummy,li.gplus span.switch', function () {
                    $container_gplus.find('.gplus_one_dummy').replaceWith(gplus_code);
                });
            }
        }); // this.each(function ()
    };      // $.fn.socialSharePrivacy = function (settings) {
    }(jQuery));