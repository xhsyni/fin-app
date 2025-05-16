from rest_framework import serializers
from .models import Users, Income, Expense, File, TaxUser, Tax

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = "__all__"
        extra_kwargs = {
            'password': {'write_only': True}
        }

class IncomeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Income
        fields = "__all__"

class ExpenseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Expense
        fields = "__all__"

class FileSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = File
        fields = "__all__"

class TaxUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaxUser
        fields = "__all__"

class TaxSerializer(serializers.ModelSerializer):
    tax_user = TaxUserSerializer(read_only=True)
    
    class Meta:
        model = Tax
        fields = "__all__"
