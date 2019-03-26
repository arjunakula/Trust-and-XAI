from django.conf.urls import include, url
from django.urls import path

from django.contrib import admin
admin.autodiscover()

import hello.views

# Examples:
# url(r'^$', 'gettingstarted.views.home', name='home'),
# url(r'^blog/', include('blog.urls')),

urlpatterns = [
    url(r'^$', hello.views.test, name='test'),
    url(r'^test.html', hello.views.test, name='test'),
    url(r'^finish.html', hello.views.finish, name='finish'),
    url(r'^test2.html', hello.views.test2, name='test2'),
    url(r'^test3',hello.views.test3, name='test3'),
    url(r'^explanation(\d+_*\d*).txt', hello.views.explanation, name = 'explanation'),
    url(r'^gender_explanation(\d+_*\d*).txt', hello.views.genderExplanation, name = 'genderExplanation'),

    # for explainer and evaluator demo
    url(r'^la6qa1_introduction.html', hello.views.la6qa1_introduction, name = 'la6qa1_introduction'),
    url(r'^la6att2_introduction.html', hello.views.la6att2_introduction, name = 'la6att2_introduction'),
    url(r'^la6xtm3_introduction.html', hello.views.la6xtm3_introduction, name = 'la6xtm3_introduction'),
    url(r'^explainer.html', hello.views.explainer, name = 'explainer'),
    url(r'^attention_maps.html', hello.views.attention_maps, name = 'attention_maps'),
    url(r'^x_tom_explanations.html', hello.views.x_tom_explanations, name = 'x_tom_explanations'),
    url(r'^wo_explanation.html', hello.views.wo_explanation, name = 'wo_explanation'),
    url(r'^la6att2.html', hello.views.la6att2, name = 'attention_maps'),
    url(r'^la6xtm3.html', hello.views.la6xtm3, name = 'x_tom_explanations'),
    url(r'^la6qa1.html', hello.views.la6qa1, name = 'wo_explanation'),
    url(r'^la6qa1_test.html', hello.views.la6qa1_test, name = 'la6qa1_test'),
    url(r'^la6att2_test.html', hello.views.la6att2_test, name = 'la6att2_test'),
    url(r'^la6xtm3_test.html', hello.views.la6xtm3_test, name = 'la6xtm3_test'),
    url(r'^evaluator_results.html', hello.views.evaluator_results, name = 'evaluator_results'),

    url(r'^demo(\d+).png', hello.views.getImages, name = 'getImage'),
    url(r'^gender_demo(\d+).png', hello.views.getGenderImages, name = 'getGenderImage'),
    url(r'^questionSet.txt', hello.views.getQuestionSet, name = 'getQuestionSet'),
    url(r'^gender_questionSet.txt', hello.views.getGenderQuestionSet, name = 'getGenderQuestionSet'),
    url(r'^db', hello.views.db, name='db'),
    # url(r'^getBestActions', hello.views.getBestActions, name = 'getBestActions'),
    url(r'^saveAnswers', hello.views.saveAnswers, name = 'saveAnswers'),
    path('admin/', admin.site.urls),
]
