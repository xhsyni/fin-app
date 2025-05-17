from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, IncomeViewSet, ExpenseViewSet, FileViewSet, TaxUserViewSet, TaxViewSet
from .views import userLogin,signupUser,viewAllTax,chatWithAI,updateTax,addTax,exportReport,updateUser
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'incomes', IncomeViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'files', FileViewSet)
router.register(r'taxusers', TaxUserViewSet)
router.register(r'taxes', TaxViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/signupUser', signupUser, name='signupUser'),
    path('api/users/login', userLogin, name='user-login'),
    path('api/users/updateUser', updateUser, name='updateUser'),
    path('api/tax/viewAllTax', viewAllTax, name='viewAllTax'),
    path('api/tax/chatWithAI', chatWithAI, name='chatWithAI'),
    path('api/tax/addTax', addTax, name='addTax'),
    path('api/tax/updateTax', updateTax, name='updateTax'),
    path('api/tax/exportReport', exportReport, name='exportReport'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
