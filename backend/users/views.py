from django.shortcuts import render
from .models import User, Category, Relationship, Income, Expense, File, TaxUser, Tax, Notification
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import UserSerializer, CategorySerializer, RelationshipSerializer, IncomeSerializer, ExpenseSerializer, FileSerializer, TaxUserSerializer, TaxSerializer, NotificationSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password


# Create your views here.
@api_view(['GET','POST'])
def userLogin(request):
    username = request.data.get('email')
    password = request.data.get('password')
    print(username)
    print(password)
    return Response({"message": "ok","userInfo":{"username":username,"password":password},"access":12}, status=status.HTTP_200_OK)
        

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class RelationshipViewSet(viewsets.ModelViewSet):
    queryset = Relationship.objects.all()
    serializer_class = RelationshipSerializer

class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

class TaxUserViewSet(viewsets.ModelViewSet):
    queryset = TaxUser.objects.all()
    serializer_class = TaxUserSerializer

class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
