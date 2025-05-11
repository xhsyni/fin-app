from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CategoryViewSet, RelationshipViewSet, IncomeViewSet, ExpenseViewSet, FileViewSet, TaxUserViewSet, TaxViewSet, NotificationViewSet
from .views import userLogin

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'relationships', RelationshipViewSet)
router.register(r'incomes', IncomeViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'files', FileViewSet)
router.register(r'taxusers', TaxUserViewSet)
router.register(r'taxes', TaxViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/login', userLogin, name='user-login'),
]
