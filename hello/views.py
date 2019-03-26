from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Greeting
from gettingstarted.settings import EXPLANATION_FILES

import json
import numpy as np
import csv

# Create your views here.
#helper function for numpy to JSON
def default(o):
    if isinstance(o, np.int64): return int(o)  
    raise TypeError

def saveAnswers(request):
    answers_dict = json.loads(request.POST.__getitem__('answers'))
    name = request.POST.__getitem__('type') + ".csv"
    print(name);
    print(answers_dict);
    f = open(name,'a')
    w = csv.DictWriter(f,answers_dict.keys())
    w.writerow(answers_dict)
    f.close()
    return HttpResponse()

# def getBestActions(request):
#     state = inference.parseCSV(EXPLANATION_FILES + "/task1_1.csv")
#     hx = [0]*32
#     cx = [0]*32
#     print(request.GET.dict())
#     if request.GET.__contains__('state'):
#         state = json.loads(request.GET.__getitem__('state'))
#     if request.GET.__contains__('hx'):
#         hx = json.loads(request.GET.__getitem__('hx'))
#     if request.GET.__contains__('cx'):
#         cx = json.loads(request.GET.__getitem__('cx'))
#     actions = inference.infer(state, hx, cx)
#     return HttpResponse(json.dumps(actions, default=default), content_type="application/json")


def test(request):
    # return HttpResponse('Hello from Python!')
    return render(request, 'test.html')

def finish(request):
    # return HttpResponse('Hello from Python!')
    return render(request, 'xai_demo_pages/finish.html')


def test2(request):
    # return HttpResponse('Hello from Python!')
    return render(request, 'test2.html')

def test3(request):
    return render(request, 'test3.html')

# for explainer and evaluator demo
def la6qa1_introduction(request):
    return render(request, 'xai_demo_pages/la6qa1_introduction.html')

def la6att2_introduction(request):
    return render(request, 'xai_demo_pages/la6att2_introduction.html')

def la6xtm3_introduction(request):
    return render(request, 'xai_demo_pages/la6xtm3_introduction.html')

def explainer(request):
    return render(request, 'xai_demo_pages/explainer.html')

def attention_maps(request):
    return render(request, 'xai_demo_pages/attention_maps.html')

def x_tom_explanations(request):
    return render(request, 'xai_demo_pages/x_tom_explanations.html')

def wo_explanation(request):
    return render(request, 'xai_demo_pages/wo_explanation.html')

def la6att2(request):
    return render(request, 'xai_demo_pages/la6att2.html')

def la6xtm3(request):
    return render(request, 'xai_demo_pages/la6xtm3.html')

def la6qa1(request):
    return render(request, 'xai_demo_pages/la6qa1.html')

@ensure_csrf_cookie
def la6qa1_test(request):
    return render(request, 'xai_demo_pages/la6qa1_test.html')

@ensure_csrf_cookie
def la6att2_test(request):
    return render(request, 'xai_demo_pages/la6att2_test.html')

@ensure_csrf_cookie
def la6xtm3_test(request):
    return render(request, 'xai_demo_pages/la6xtm3_test.html')

def evaluator_results(request):
    return render(request, 'xai_demo_pages/evaluator_results.html')


def explanation(request, number):
    filepath = EXPLANATION_FILES + '/explanation' + number + '.txt'
    with open(filepath, 'r') as fp:
        data = fp.read()
    # filename = 'some-filename.xlsx'
    # response = HttpResponse(mimetype="application/ms-excel")
    # response['Content-Disposition'] = 'attachment; filename=%s' % filename # force browser to download file
    response = HttpResponse()
    response.write(data)
    return response

def genderExplanation(request, number):
    filepath = EXPLANATION_FILES + '/gender_explanation' + number + '.txt'
    with open(filepath, 'r') as fp:
        data = fp.read()
    # filename = 'some-filename.xlsx'
    # response = HttpResponse(mimetype="application/ms-excel")
    # response['Content-Disposition'] = 'attachment; filename=%s' % filename # force browser to download file
    response = HttpResponse()
    response.write(data)
    return response

def getImages(request, number):
    filepath = EXPLANATION_FILES + '/demo' + number + '.png'
    with open(filepath, "rb") as f:
        return HttpResponse(f.read(), content_type="image/png")

def getGenderImages(request, number):
    filepath = EXPLANATION_FILES + '/gender_demo' + number + '.png'
    with open(filepath, "rb") as f:
        return HttpResponse(f.read(), content_type="image/png")


def getQuestionSet(request):
    filepath = EXPLANATION_FILES + '/questionSet.txt'
    with open(filepath, 'r') as fp:
        data = fp.read()
    # filename = 'some-filename.xlsx'
    # response = HttpResponse(mimetype="application/ms-excel")
    # response['Content-Disposition'] = 'attachment; filename=%s' % filename # force browser to download file
    response = HttpResponse()
    response.write(data)
    return response     

def getGenderQuestionSet(request):
    filepath = EXPLANATION_FILES + '/gender_questionSet.txt'
    with open(filepath, 'r') as fp:
        data = fp.read()
    # filename = 'some-filename.xlsx'
    # response = HttpResponse(mimetype="application/ms-excel")
    # response['Content-Disposition'] = 'attachment; filename=%s' % filename # force browser to download file
    response = HttpResponse()
    response.write(data)
    return response     

def db(request):
    greeting = Greeting()
    greeting.save()
    greetings = Greeting.objects.all()
    return render(request, 'db.html', {'greetings': greetings})

