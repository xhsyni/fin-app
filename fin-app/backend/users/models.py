from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(
            email=self.normalize_email(email),
            name=name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)

class Users(AbstractBaseUser, PermissionsMixin):
    userid = models.AutoField(primary_key=True, db_column='userid')
    email = models.EmailField(unique=True, db_column='email')
    name = models.CharField(max_length=150, db_column='name')
    phone = models.CharField(max_length=15, db_column='phone', null=True)
    job = models.CharField(max_length=30, db_column='job',  null=True)
    birth_date = models.DateField(db_column='birth_date',null=True)
    created_at = models.DateTimeField(db_column='created_at', auto_now_add=True)
    marital_status = models.BooleanField(db_column='marital_status', default=False)
    ethnicity = models.CharField(max_length=30, db_column='ethnicity', null=True)
    gender = models.CharField(max_length=10, db_column='gender', null=True)
    nationality = models.CharField(max_length=30, db_column='nationality', null=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Required fields for Django authentication
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']  # Required fields for creating a user

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.name
    
class Income(models.Model):
    incomeid = models.AutoField(primary_key=True, db_column='incomeid')
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    category = models.CharField(max_length=50,db_column='category')
    date = models.DateField(db_column='date')
    source = models.CharField(max_length=50, db_column='source')
    amount = models.DecimalField(max_digits=20, decimal_places=2, db_column='amount')
    job = models.CharField(max_length=30, db_column='job', blank=True, null=True)
    typeInc = models.CharField(max_length=50, db_column='type', blank=True, null=True)

    class Meta:
        db_table = 'income'

    def __str__(self):
        return self.incomeid

class TaxUser(models.Model):
    taxuserid = models.AutoField(primary_key=True, db_column='taxuserid')
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    tax_year = models.IntegerField(db_column='tax_year')
    tax_income = models.DecimalField(max_digits=12, decimal_places=2, db_column='tax_income')
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='amount')
    job = models.CharField(max_length=30, db_column='job', null=True)

    class Meta:
        db_table = 'tax_user'

    def __str__(self):
        return self.taxuserid

class Expense(models.Model):
    expenseid = models.AutoField(primary_key=True, db_column='expenseid')
    userid = models.ForeignKey(Users, on_delete=models.CASCADE)
    date = models.DateField(db_column='date')
    category = models.CharField(max_length=50,db_column='category')
    sub_category = models.CharField(max_length=50,db_column='sub_category')
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='amount')
    name = models.CharField(max_length=150, db_column='name')
    description = models.TextField(null=True,db_column="description")
    deductible = models.BooleanField(default=False,db_column="isDeductible")
    taxuserid = models.ForeignKey(TaxUser, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'expense'

    def __str__(self):
        return self.expenseid

class File(models.Model):
    fileid = models.AutoField(primary_key=True, db_column='fileid')
    expenseid = models.ForeignKey(Expense, on_delete=models.CASCADE,null=True)
    incomeid = models.ForeignKey(Income, on_delete=models.CASCADE,null=True)
    filepath = models.CharField(max_length=255, db_column='filepath')
    file = models.FileField(upload_to='files/', null=True, blank=True, db_column='file')

    class Meta:
        db_table = 'file'

    def __str__(self):
        return self.filepath
    
class Tax(models.Model):
    year = models.IntegerField(db_column='year')
    category = models.CharField(max_length=30, db_column='category')
    charge_income = models.DecimalField(max_digits=12, decimal_places=2, db_column='chargeIncome')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, db_column='taxRate')
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='tax_amount')

    class Meta:
        db_table = 'tax'

    def __str__(self):
        return self.year
