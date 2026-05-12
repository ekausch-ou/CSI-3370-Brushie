import random
import copy
import json

from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.models import User
from .forms import RegisterForm

# Homepage View
def home(request):

    return render(request, "pages/home.html")

# About View
def about(request):

    return render(request, "pages/about.html")


# User Registration View
def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
        else:
            return render(request, "registration/register.html", {
                "form": form,
                })

    else:
        form = RegisterForm()

    return render(request, "registration/register.html", {
        "form": form,
        })
