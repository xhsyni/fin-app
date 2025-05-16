from django.shortcuts import render
from .models import Users, Income, Expense, File, TaxUser, Tax
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import UserSerializer, IncomeSerializer, ExpenseSerializer, FileSerializer, TaxUserSerializer, TaxSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.
@api_view(['GET','POST'])
def userLogin(request):
    emailInput = request.data.get('email')
    passwordInput = request.data.get('password')
    print(make_password("abcd"))
    
    try:
        user = Users.objects.get(email=emailInput)
        if check_password(passwordInput, user.password):
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login successful",
                "user": {
                    "name": user.name,
                    "email": user.email,
                    "userid": user.userid,
                    "job":user.job
                },
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Users.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET','POST'])
def signupUser(request):
    nameInput = request.data.get('name')
    emailInput = request.data.get('email')
    passwordInput = request.data.get('password')

    hashedPassword = make_password(passwordInput)
    Users.objects.create(
        name = nameInput,
        email = emailInput,
        password=hashedPassword,
    )
    return Response({
        "message": "Register successful"
    }, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UserSerializer

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

